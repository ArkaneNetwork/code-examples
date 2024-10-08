import { Chains, Erc20Token, Wallet } from './models';
import { User }                       from './user';
import { Payer }                      from './payer';
import { Utils }                      from './utils';

const user = new User();
const payer = new Payer();

const chain = Chains.POLYGON_AMOY;
const userWallet: Wallet = {
    id: '35e0550f-f380-433f-9b2a-b340cc28d37f',
    address: '0xd23087B91c2399dc1AFB337E968EFE9a5081941d',
    signingMethod: {
        id: '147fb60c-a00c-46fe-aef9-8eaf6563d945',
        value: '111111',
    },
};
const payerWallet: Wallet = {
    id: 'ac3164cd-6735-43b3-a938-772313ca3ee7',
    address: '0x9Af5c72Aa7E34C3BFa01f4AF5C3c30dE40eDD186',
    signingMethod: {
        id: '147fb60c-a00c-46fe-aef9-8eaf6563d945',
        value: '111111',
    }
};
const token: Erc20Token = {
    contract: {
        address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
        name: 'USDC',
    },
    decimals: 6,
    amount: 1,
};
const toWalletAddress = '0x427d0ADDAa77d8Bb871DBeA3458DeA4B5198730C';

export function main() {
    const option = Utils.getRunArgument('FUNCTION');
    switch (option) {
        case  'transferWithAuthorization':
            testTransferWithAuthorization()
                .then(() => console.log('done'));
            break;
        case 'permitTransferFrom':
            permitTransferFrom()
                .then(() => console.log('done'));
            break;
        default:
            throw `Unrecognized FUNCTION: ${process.env.OPTION}`
    }

}


async function testTransferWithAuthorization() {
    const eip712Domain = await user.buildEip712DomainForTransferWithAuthorization(chain, userWallet, token, toWalletAddress);
    console.log('EIP712 result:', eip712Domain);

    const eip712Signature = await user.signEip712Message(chain, userWallet, eip712Domain);
    console.log('eip712Signature', eip712Signature);

    const response = await payer.executeTransferWithAuthorization(chain, payerWallet, eip712Domain, eip712Signature);
    console.log('final response', response);
}

async function permitTransferFrom() {
    const eip712Domain = await user.buildEip712DomainForPermitTransfer(chain, userWallet, token, payerWallet);
    console.log('EIP712 result:', eip712Domain);

    const eip712Signature = await user.signEip712Message(chain, userWallet, eip712Domain);
    console.log('eip712Signature', eip712Signature);

    const permitResponse = await payer.executePermit(chain, payerWallet, eip712Domain, eip712Signature);
    console.log('permit response', permitResponse);

    const response = await payer.executeTransferFrom(chain, payerWallet, eip712Domain, toWalletAddress);
    console.log('transfer response', response);
}

main();
