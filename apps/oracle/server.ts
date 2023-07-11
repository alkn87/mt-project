import express, {Request, Response} from 'express';
import {Wallet} from "ethers";
import {getMapClaimContract, getProvider, getVerificationOracleContract} from "./lib/blockchain-connection/connection";

const app = express();

const mapClaimContract = getMapClaimContract();
const verificationOracleContract = getVerificationOracleContract()

async function verifyClaim(mapClaimId: string) {
    const provider = getProvider();
    const signer = await provider.getSigner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    mapClaimContract.connect(signer);
    const signerWallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

    // const accountNonce =
    //   '0x' + (await signerWallet.getNonce()).toString(16)
    //
    // let verifyClaimTxData = {
    //     from: signerWallet.address,
    //     gasLimit: 1_000_000,
    //     gasPrice: await provider.getFeeData().then(feeData => feeData.gasPrice),
    //     nonce: accountNonce
    // }

    await mapClaimContract.connect(signerWallet).verifyClaim(mapClaimId);
}

app.get('/events', async (req: Request, res: Response) => {
    mapClaimContract.owner().then((owner) => {
        console.log(owner);
    });

    res.json(await mapClaimContract.owner());
});

app.listen(7654, () => {
    const oracleListener = verificationOracleContract.then(contract => {
        contract.addListener('VerifyMintStrike', (senderAddress, mintStrike, changeSetId, mapUserName, mapClaimId) => {
            verifyClaim(mapClaimId).then(r => console.log(r));
            console.log('verify');
        });
    });
    console.log('App is listening on port 7654');
});
