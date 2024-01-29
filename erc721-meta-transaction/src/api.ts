import axios                      from 'axios';
import { API_ROOT, BEARER_TOKEN } from './config';
import { SigningMethod }          from './metatransaction/models';


export class Api {

    async getNonce(secretType: string,
                   contractAddress: string,
                   walletAddress: string): Promise<any> {
        const getNonceRequest = {
            secretType: secretType,
            contractAddress: contractAddress,
            functionName: 'getNonce',
            inputs: [
                {
                    type: 'address',
                    value: walletAddress,
                },
            ],
            outputs: [
                {
                    type: 'uint256',
                },
            ],
        };
        const res = await this.doPost('/contracts/read', getNonceRequest);
        return res[0].value;
    }

    async sign(signatureRequest: any,
               signingMethod: SigningMethod) {
        return await this.doPost('/signatures', signatureRequest, signingMethod);
    }

    async executeTransaction(transactionRequest: any,
                             signingMethod: SigningMethod): Promise<{ transactionHash: string }> {
        return await this.doPost('/transactions', transactionRequest, signingMethod);
    }


    async doPost(url: string,
                 body: any,
                 signingMethod?: SigningMethod): Promise<any> {
        let headers: any = {
            Authorization: 'Bearer ' + BEARER_TOKEN,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        if (signingMethod) {
            headers['Signing-Method'] = `${signingMethod?.id}:${signingMethod?.value}`;
        }
        const resp = await axios
            .post(API_ROOT + url, body, {headers})
            .then(resp => resp.data)
            .catch(err => err.response);
        if (!resp.success) {
            const message = resp.status + ' Api Error';
            console.error(message);
            console.error(resp.data);
            throw message;
        }
        return resp.result;
    }
}