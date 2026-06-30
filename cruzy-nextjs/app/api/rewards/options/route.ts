import { NextResponse } from 'next/server'
import { getToken, sfQuery, sfPicklistValues } from '@/lib/salesforce'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET() {
  try {
    const { access_token, instance_url } = await getToken()

    // Site codes are the active values of the Reward_Location__c picklist.
    const codes = await sfPicklistValues(access_token, instance_url, 'Reward__c', 'Reward_Location__c')

    const agents = await sfQuery<{ Name: string }>(
      access_token,
      instance_url,
      'SELECT Name FROM Reward_Agent__c WHERE Active__c = true ORDER BY Name'
    )

    return NextResponse.json(
      {
        sites: codes.map((code) => ({ code, label: code })),
        agents: agents.map((a) => ({ name: a.Name })),
      },
      { headers: CORS }
    )
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json(
      { message: e.message || 'Failed to load options' },
      { status: 500, headers: CORS }
    )
  }
}
