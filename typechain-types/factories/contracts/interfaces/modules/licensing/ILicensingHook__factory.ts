/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ILicensingHook,
  ILicensingHookInterface,
} from "../../../../../contracts/interfaces/modules/licensing/ILicensingHook";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    name: "beforeMintLicenseTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "totalMintingFee",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "parentIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    name: "beforeRegisterDerivative",
    outputs: [
      {
        internalType: "uint256",
        name: "mintingFee",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
      {
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    name: "calculateMintingFee",
    outputs: [
      {
        internalType: "uint256",
        name: "totalMintingFee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class ILicensingHook__factory {
  static readonly abi = _abi;
  static createInterface(): ILicensingHookInterface {
    return new Interface(_abi) as ILicensingHookInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ILicensingHook {
    return new Contract(address, _abi, runner) as unknown as ILicensingHook;
  }
}
