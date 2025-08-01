/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IOOV3Callbacks,
  IOOV3CallbacksInterface,
} from "../../../../../../../contracts/interfaces/modules/dispute/policies/UMA/IOOV3Callbacks";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "assertionId",
        type: "bytes32",
      },
    ],
    name: "assertionDisputedCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "assertionId",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "assertedTruthfully",
        type: "bool",
      },
    ],
    name: "assertionResolvedCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IOOV3Callbacks__factory {
  static readonly abi = _abi;
  static createInterface(): IOOV3CallbacksInterface {
    return new Interface(_abi) as IOOV3CallbacksInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IOOV3Callbacks {
    return new Contract(address, _abi, runner) as unknown as IOOV3Callbacks;
  }
}
