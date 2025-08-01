/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IGroupIPAssetRegistry,
  IGroupIPAssetRegistryInterface,
} from "../../../../contracts/interfaces/registries/IGroupIPAssetRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "ipIds",
        type: "address[]",
      },
    ],
    name: "addGroupMember",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
      {
        internalType: "address",
        name: "ipId",
        type: "address",
      },
    ],
    name: "containsIp",
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
        internalType: "address",
        name: "groupId",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "startIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
    ],
    name: "getGroupMembers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
    ],
    name: "getGroupRewardPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
    ],
    name: "isRegisteredGroup",
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
        internalType: "address",
        name: "rewardPool",
        type: "address",
      },
    ],
    name: "isWhitelistedGroupRewardPool",
    outputs: [
      {
        internalType: "bool",
        name: "isWhitelisted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "groupNft",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "groupNftId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "rewardPool",
        type: "address",
      },
      {
        internalType: "address",
        name: "registerFeePayer",
        type: "address",
      },
    ],
    name: "registerGroup",
    outputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "ipIds",
        type: "address[]",
      },
    ],
    name: "removeGroupMember",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "groupId",
        type: "address",
      },
    ],
    name: "totalMembers",
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
        internalType: "address",
        name: "rewardPool",
        type: "address",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "whitelistGroupRewardPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IGroupIPAssetRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): IGroupIPAssetRegistryInterface {
    return new Interface(_abi) as IGroupIPAssetRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IGroupIPAssetRegistry {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IGroupIPAssetRegistry;
  }
}
