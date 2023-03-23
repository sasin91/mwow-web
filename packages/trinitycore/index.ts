import { createClientAsync } from 'soap'
import type { Client } from 'soap'

const globalForSoap = globalThis as unknown as { soap: Client };

export const soap =
    globalForSoap.soap || await createClientAsync(process.env.TRINITYCORE_SOAP_URL!, {
        
    });