import { NextRequest, NextResponse } from 'next/server'
import { pushToSalesforce } from '@/lib/salesforce'

const MEMBERSHIP_PRICE = parseFloat(process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE || '89.00')
const API_LOGIN_ID = process.env.AUTHNET_API_LOGIN_ID!
const TRANSACTION_KEY = process.env.AUTHNET_TRANSACTION_KEY!
const AUTHNET_ENV = process.env.NEXT_PUBLIC_AUTHNET_ENV || 'sandbox'

const AUTHNET_URL =
  AUTHNET_ENV === 'production'
    ? 'https://api.authorize.net/xml/v1/request.api'
    : 'https://apitest.authorize.net/xml/v1/request.api'

async function authnetPost(payload: object): Promise<{ [key: string]: unknown }> {
  const res = await fetch(AUTHNET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  // Authorize.net sometimes returns a BOM character — strip it
  const clean = text.replace(/^\uFEFF/, '')
  return JSON.parse(clean)
}

async function createCustomerProfile(data: {
  email: string
  firstName: string
  lastName: string
  opaqueDataDescriptor: string
  opaqueDataValue: string
  address: { street: string; city: string; state: string; zip: string; country: string }
}): Promise<{ customerProfileId: string; customerPaymentProfileId: string }> {
  const payload = {
    createCustomerProfileRequest: {
      merchantAuthentication: { name: API_LOGIN_ID, transactionKey: TRANSACTION_KEY },
      profile: {
        merchantCustomerId: `CRUZY-${Date.now()}`,
        email: data.email,
        paymentProfiles: {
          customerType: 'individual',
          billTo: {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zip: data.address.zip,
            country: data.address.country,
          },
          payment: {
            opaqueData: {
              dataDescriptor: data.opaqueDataDescriptor,
              dataValue: data.opaqueDataValue,
            },
          },
        },
      },
      validationMode: AUTHNET_ENV === 'production' ? 'liveMode' : 'testMode',
    },
  }

  const result = await authnetPost(payload) as {
    messages: { resultCode: string; message: Array<{ code: string; text: string }> }
    customerProfileId: string
    customerPaymentProfileIdList: string[]
  }

  if (result.messages.resultCode !== 'Ok') {
    throw new Error(`Authorize.net profile error: ${result.messages.message[0]?.text}`)
  }

  return {
    customerProfileId: result.customerProfileId,
    customerPaymentProfileId: result.customerPaymentProfileIdList[0],
  }
}

async function chargeCustomerProfile(data: {
  customerProfileId: string
  customerPaymentProfileId: string
  amount: number
  description: string
  email: string
}): Promise<{ transactionId: string }> {
  const payload = {
    createTransactionRequest: {
      merchantAuthentication: { name: API_LOGIN_ID, transactionKey: TRANSACTION_KEY },
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: data.amount.toFixed(2),
        profile: {
          customerProfileId: data.customerProfileId,
          paymentProfile: { paymentProfileId: data.customerPaymentProfileId },
        },
        order: { description: data.description },
        customer: { email: data.email },
      },
    },
  }

  const result = await authnetPost(payload) as {
    messages: { resultCode: string; message: Array<{ code: string; text: string }> }
    transactionResponse: {
      responseCode: string
      transId: string
      errors?: Array<{ errorCode: string; errorText: string }>
    }
  }

  if (
    result.messages.resultCode !== 'Ok' ||
    result.transactionResponse?.responseCode !== '1'
  ) {
    const errText =
      result.transactionResponse?.errors?.[0]?.errorText ||
      result.messages.message[0]?.text ||
      'Transaction declined'
    throw new Error(errText)
  }

  return { transactionId: result.transactionResponse.transId }
}

async function getCardDetails(data: {
  customerProfileId: string
  customerPaymentProfileId: string
}): Promise<{ cardType: string; cardNumber: string; expirationDate: string }> {
  const payload = {
    getCustomerPaymentProfileRequest: {
      merchantAuthentication: { name: API_LOGIN_ID, transactionKey: TRANSACTION_KEY },
      customerProfileId: data.customerProfileId,
      customerPaymentProfileId: data.customerPaymentProfileId,
    },
  }

  const result = await authnetPost(payload) as {
    paymentProfile?: {
      payment?: {
        creditCard?: {
          cardNumber: string
          expirationDate: string
          cardType: string
        }
      }
    }
  }

  const card = result.paymentProfile?.payment?.creditCard
  return {
    cardType: card?.cardType || 'Card',
    cardNumber: card?.cardNumber || 'XXXX',
    expirationDate: card?.expirationDate || '',
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      street1,
      street2,
      city,
      state,
      postalCode,
      country,
      spouseFirstName,
      spouseLastName,
      authorizedUsers,
      nameOnCard,
      opaqueDataDescriptor,
      opaqueDataValue,
      promoDiscount,
    } = body

    if (!opaqueDataDescriptor || !opaqueDataValue) {
      return NextResponse.json({ success: false, error: 'Payment token is required' }, { status: 400 })
    }

    const finalAmount = Math.max(0, MEMBERSHIP_PRICE - (promoDiscount || 0))

    // 1. Create Authorize.net Customer Profile (saves card for future charges)
    const { customerProfileId, customerPaymentProfileId } = await createCustomerProfile({
      email,
      firstName,
      lastName,
      opaqueDataDescriptor,
      opaqueDataValue,
      address: {
        street: [street1, street2].filter(Boolean).join(' '),
        city,
        state: state || '',
        zip: postalCode,
        country,
      },
    })

    // 2. Charge the customer profile
    const { transactionId } = await chargeCustomerProfile({
      customerProfileId,
      customerPaymentProfileId,
      amount: finalAmount,
      description: 'Cruzy+ Annual Membership',
      email,
    })

    // 3. Get card details for SF Saved_Card__c
    const cardDetails = await getCardDetails({ customerProfileId, customerPaymentProfileId })
    const last4 = cardDetails.cardNumber.slice(-4)
    const [expYear, expMonth] = cardDetails.expirationDate.includes('-')
      ? cardDetails.expirationDate.split('-')
      : [cardDetails.expirationDate.slice(0, 4), cardDetails.expirationDate.slice(4, 6)]

    // 4. Push to Salesforce
    let sfResult = null
    try {
      sfResult = await pushToSalesforce({
        firstName,
        lastName,
        email,
        phone,
        street1,
        street2,
        city,
        state,
        postalCode,
        country,
        spouseFirstName,
        spouseLastName,
        authorizedUsers,
        nameOnCard,
        authnetCustomerProfileId: customerProfileId,
        authnetPaymentProfileId: customerPaymentProfileId,
        authnetTransactionId: transactionId,
        cardBrand: cardDetails.cardType,
        cardLast4: last4,
        cardExpMonth: parseInt(expMonth || '0'),
        cardExpYear: parseInt(expYear || '0'),
      })
      console.log(`✅ SF Contact: ${sfResult.contactId} | Membership: ${sfResult.membershipId}`)
    } catch (sfErr) {
      console.error('⚠️ Salesforce push failed (payment succeeded):', sfErr)
    }

    const cruzyMemberId =
      sfResult?.cruzyMemberId ??
      `CRUZY-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${customerProfileId.slice(-6)}`

    return NextResponse.json({
      success: true,
      cruzyMemberId,
      transactionId,
      customerProfileId,
      customerPaymentProfileId,
      salesforceContactId: sfResult?.contactId ?? null,
      salesforceMembershipId: sfResult?.membershipId ?? null,
      memberName: `${firstName} ${lastName}`,
      email,
      amount: finalAmount,
    })
  } catch (err) {
    const error = err as { message?: string }
    console.error('Submit error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
