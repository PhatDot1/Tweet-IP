/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IAccessController,
  IAccessControllerInterface,
} from "../../../../contracts/interfaces/access/IAccessController";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "ipAccountOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "PermissionSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "ipAccountOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "TransientPermissionSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
    ],
    name: "checkPermission",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
    ],
    name: "getPermanentPermission",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
    ],
    name: "getPermission",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
    ],
    name: "getTransientPermission",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "setAllPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "setAllTransientPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "ipAccount",
            type: "address",
          },
          {
            internalType: "address",
            name: "signer",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "func",
            type: "bytes4",
          },
          {
            internalType: "uint8",
            name: "permission",
            type: "uint8",
          },
        ],
        internalType: "struct AccessPermission.Permission[]",
        name: "permissions",
        type: "tuple[]",
      },
    ],
    name: "setBatchPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "ipAccount",
            type: "address",
          },
          {
            internalType: "address",
            name: "signer",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "func",
            type: "bytes4",
          },
          {
            internalType: "uint8",
            name: "permission",
            type: "uint8",
          },
        ],
        internalType: "struct AccessPermission.Permission[]",
        name: "permissions",
        type: "tuple[]",
      },
    ],
    name: "setBatchTransientPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "setPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "ipAccount",
        type: "address",
      },
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "func",
        type: "bytes4",
      },
      {
        internalType: "uint8",
        name: "permission",
        type: "uint8",
      },
    ],
    name: "setTransientPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IAccessController__factory {
  static readonly abi = _abi;
  static createInterface(): IAccessControllerInterface {
    return new Interface(_abi) as IAccessControllerInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IAccessController {
    return new Contract(address, _abi, runner) as unknown as IAccessController;
  }
}
