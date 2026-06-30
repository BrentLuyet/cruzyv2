import { NextRequest, NextResponse } from 'next/server'
import { getToken, sfPost, sfQuery } from '@/lib/salesforce'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Escape single quotes/backslashes for safe inline SOQL string literals.
function soql(v: string): string {
  return String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const passkey = (body.passkey || '').toString()
    const agent = (body.agent || '').toString().trim()
    const firstName = (body.firstName || '').toString().trim()
    const lastName = (body.lastName || '').toString().trim()
    const email = (body.email || '').toString().trim()
    const siteCode = (body.siteCode || '').toString().trim()
    const iticket = (body.iticket || '').toString().trim()

    if (!passkey || !agent || !firstName || !lastName || !email || !siteCode || !iticket) {
      return NextResponse.json(
        { message: 'Please fill in all required fields.' },
        { status: 400, headers: CORS }
      )
    }

    const { access_token, instance_url } = await getToken()

    // 1. Authenticate the agent against the roster (active + matching passkey).
    const agents = await sfQuery<{ Id: string }>(
      access_token,
      instance_url,
      `SELECT Id FROM Reward_Agent__c WHERE Name = '${soql(agent)}' AND Passkey__c = '${soql(passkey)}' AND Active__c = true LIMIT 1`
    )
    if (!agents.length) {
      return NextResponse.json(
        { message: 'Invalid agent or passkey.' },
        { status: 401, headers: CORS }
      )
    }
    const agentId = agents[0].Id

    // 2. Allocate a unique reward number.
    const rewardNumber = await nextRewardNumber(access_token, instance_url)

    // 3. Create the reward. The selected site code is stored on the
    //    Reward_Location__c picklist for tracking.
    const today = new Date().toISOString().split('T')[0]
    const result = await sfPost(access_token, instance_url, 'Reward__c', {
      Reward_Number__c: rewardNumber,
      Status__c: 'Issued',
      Customer_First_Name__c: firstName,
      Customer_Last_Name__c: lastName,
      Customer_Email__c: email,
      iTicket_TRX__c: iticket,
      Agent__c: agentId,
      Reward_Location__c: siteCode,
      Issue_Date__c: today,
    })

    return NextResponse.json(
      { rewardNumber, rewardId: result.id },
      { headers: CORS }
    )
  } catch (err) {
    const e = err as { message?: string }
    console.error('Reward request error:', e)
    return NextResponse.json(
      { message: e.message || 'Could not issue reward.' },
      { status: 500, headers: CORS }
    )
  }
}

// Continue the existing 6-digit numeric series (100000–999999). Reward numbers
// are not DB-unique (legacy data has duplicates), so verify availability before use.
async function nextRewardNumber(token: string, instanceUrl: string): Promise<string> {
  const rows = await sfQuery<{ Reward_Number__c: string }>(
    token,
    instanceUrl,
    "SELECT Reward_Number__c FROM Reward__c WHERE Reward_Number__c LIKE '1_____' ORDER BY Reward_Number__c DESC LIMIT 1"
  )
  let n = rows.length ? parseInt(rows[0].Reward_Number__c, 10) : 100000
  if (Number.isNaN(n)) n = 100000

  for (let i = 0; i < 25; i++) {
    n += 1
    const candidate = String(n)
    const existing = await sfQuery<{ Id: string }>(
      token,
      instanceUrl,
      `SELECT Id FROM Reward__c WHERE Reward_Number__c = '${candidate}' LIMIT 1`
    )
    if (!existing.length) return candidate
  }
  throw new Error('Could not allocate a unique reward number.')
}
