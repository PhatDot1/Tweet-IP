/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IExternalRoyaltyPolicyBase,
  IExternalRoyaltyPolicyBaseInterface,
} from "../../../../../../contracts/interfaces/modules/royalty/policies/IExternalRoyaltyPolicyBase";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "licensePercent",
        type: "uint32",
      },
    ],
    name: "getPolicyRtsRequiredToLink",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IExternalRoyaltyPolicyBase__factory {
  static readonly abi = _abi;
  static createInterface(): IExternalRoyaltyPolicyBaseInterface {
    return new Interface(_abi) as IExternalRoyaltyPolicyBaseInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IExternalRoyaltyPolicyBase {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IExternalRoyaltyPolicyBase;
  }
}
