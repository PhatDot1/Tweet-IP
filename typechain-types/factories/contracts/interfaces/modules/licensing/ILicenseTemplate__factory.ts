/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ILicenseTemplate,
  ILicenseTemplateInterface,
} from "../../../../../contracts/interfaces/modules/licensing/ILicenseTemplate";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "licenseTemplate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "licenseTerms",
        type: "bytes",
      },
    ],
    name: "LicenseTermsRegistered",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "allowDerivativeRegistration",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "canAttachToGroupIp",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "newRoyaltyPercent",
        type: "uint32",
      },
    ],
    name: "canOverrideRoyaltyPercent",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "exists",
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
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "licenseTermsIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
    ],
    name: "getEarlierExpireTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
    ],
    name: "getExpireTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "getLicenseTermsURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMetadataURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "getRoyaltyPolicy",
    outputs: [
      {
        internalType: "address",
        name: "royaltyPolicy",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "royaltyPercent",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "mintingLicenseFee",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "currencyToken",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "isLicenseTransferable",
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
    stateMutability: "view",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
    ],
    name: "toJson",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRegisteredLicenseTerms",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "licenseTermsIds",
        type: "uint256[]",
      },
    ],
    name: "verifyCompatibleLicenses",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "licensee",
        type: "address",
      },
      {
        internalType: "address",
        name: "licensorIpId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "verifyMintLicenseToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
        internalType: "uint256",
        name: "licenseTermsId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "licensee",
        type: "address",
      },
    ],
    name: "verifyRegisterDerivative",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "childIpId",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "parentIpId",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "licenseTermsIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "verifyRegisterDerivativeForAllParents",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ILicenseTemplate__factory {
  static readonly abi = _abi;
  static createInterface(): ILicenseTemplateInterface {
    return new Interface(_abi) as ILicenseTemplateInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ILicenseTemplate {
    return new Contract(address, _abi, runner) as unknown as ILicenseTemplate;
  }
}
