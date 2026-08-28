import { beginCell, Cell, contractAddress } from '@ton/ton';
import { Buffer } from 'buffer';

// Per-account "trampoline" of the Telegram wallet (WalletTg): the only code deployed
// for each account. The actual WalletTg bytecode lives in the network config
// (param -123), and the trampoline jumps into it, so the state init code below
// never changes across WalletTg revisions.
const walletTgTrampolineCode = 'te6cckEBAQEAGgAAMP8AIJgh10mDCLnyQN+Ahfgz0O0eIO1T2WlCfjk=';

// 0xXX prefix of the current WalletTg storage layout (bumped on each contract revision).
const walletTgStorageRevision = 0x00;

export const WALLET_TG_SUBWALLET_ID_MAINNET = 0x7fff7f11;
export const WALLET_TG_SUBWALLET_ID_TESTNET = 0x7fff7ffd;

export class WalletContractTg {
    static create(args: { workchain: number; publicKey: Buffer; walletId?: number | null }) {
        const code = Cell.fromBase64(walletTgTrampolineCode);
        const data = beginCell()
            .storeUint(walletTgStorageRevision, 8)
            .storeUint(0, 32) // seqno
            .storeUint(args.walletId ?? WALLET_TG_SUBWALLET_ID_MAINNET, 32)
            .storeBuffer(args.publicKey, 32)
            .endCell();
        const init = { code, data };
        return { init, address: contractAddress(args.workchain, init) };
    }
}
