import { DOMParser } from "@xmldom/xmldom";

const credentials = {
    username: process.env.TRINITYCORE_USERNAME!,
    password: process.env.TRINITYCORE_PASSWORD!
}

// const soapUrl = process.env.TRINITYCORE_SOAP_URL!;
const soapUrl = 'http://127.0.0.1:7878';

export const executeCommand = async (command: string) => {
    const response = await fetch(soapUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml',
            Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/1999/XMLSchema" xmlns:ns1="urn:TC">
            <SOAP-ENV:Body>
                <ns1:executeCommand>
                    <command>${command}</command>
                </ns1:executeCommand>
            </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>`
    });

    if (!response.ok) {
        throw new Error(`TC Soap API failed with ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    // console.log({ return: xml.getElementsByTagName('return') })
    // const type = xml.childNodes[0]!.textContent;
    // const whitespace = xml.childNodes[1]!.textContent;
    const data = xml.childNodes[2]!.textContent;

    return data;
};