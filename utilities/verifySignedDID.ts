// mup/src/utilities/verifySignedDID.ts
import { verifyJWT } from 'did-jwt';

export async function verifySignedData(jwt: string) {
  try {
    const verified = await verifyJWT(jwt);
    console.log('Verified JWT:', verified);
  } catch (error) {
    console.error('Failed to verify JWT:', error);
  }
}
