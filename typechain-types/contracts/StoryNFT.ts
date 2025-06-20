/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export declare namespace StoryNFT {
  export type TweetMetadataStruct = {
    name: string;
    handle: string;
    timestamp: string;
    verified: boolean;
    comments: BigNumberish;
    retweets: BigNumberish;
    likes: BigNumberish;
    analytics: BigNumberish;
    tags: string[];
    mentions: string[];
    profileImage: string;
    tweetLink: string;
    tweetId: string;
    ipfsScreenshot: string;
  };

  export type TweetMetadataStructOutput = [
    name: string,
    handle: string,
    timestamp: string,
    verified: boolean,
    comments: bigint,
    retweets: bigint,
    likes: bigint,
    analytics: bigint,
    tags: string[],
    mentions: string[],
    profileImage: string,
    tweetLink: string,
    tweetId: string,
    ipfsScreenshot: string
  ] & {
    name: string;
    handle: string;
    timestamp: string;
    verified: boolean;
    comments: bigint;
    retweets: bigint;
    likes: bigint;
    analytics: bigint;
    tags: string[];
    mentions: string[];
    profileImage: string;
    tweetLink: string;
    tweetId: string;
    ipfsScreenshot: string;
  };
}

export interface StoryNFTInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "CURRENCY_TOKEN"
      | "IP_ASSET_REGISTRY"
      | "LICENSE_REGISTRY"
      | "LICENSING_MODULE"
      | "METADATA_MODULE"
      | "PIL_TEMPLATE"
      | "ROYALTY_POLICY_LAP"
      | "approve"
      | "balanceOf"
      | "getApproved"
      | "getTweetMetadata"
      | "isApprovedForAll"
      | "maxSupply"
      | "mintAndRegisterAndCreateTermsAndAttach"
      | "mintLicenseTokenAndRegisterDerivative"
      | "mintPrice"
      | "mintedTweet"
      | "minters"
      | "name"
      | "onERC721Received"
      | "owner"
      | "ownerOf"
      | "pause"
      | "paused"
      | "renounceOwnership"
      | "royaltyInfo"
      | "safeMint"
      | "safeTransferFrom(address,address,uint256)"
      | "safeTransferFrom(address,address,uint256,bytes)"
      | "setApprovalForAll"
      | "setMintPrice"
      | "setMinter"
      | "supportsInterface"
      | "symbol"
      | "tokenByIndex"
      | "tokenOfOwnerByIndex"
      | "tokenURI"
      | "totalSupply"
      | "transferFrom"
      | "transferOwnership"
      | "tweetMetadata"
      | "unpause"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Approval"
      | "ApprovalForAll"
      | "DerivativeRegistered"
      | "OwnershipTransferred"
      | "Paused"
      | "TermsCreatedAndAttached"
      | "Transfer"
      | "TweetMinted"
      | "TweetRegistered"
      | "Unpaused"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "CURRENCY_TOKEN",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "IP_ASSET_REGISTRY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "LICENSE_REGISTRY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "LICENSING_MODULE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "METADATA_MODULE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PIL_TEMPLATE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "ROYALTY_POLICY_LAP",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getApproved",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTweetMetadata",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isApprovedForAll",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "maxSupply", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mintAndRegisterAndCreateTermsAndAttach",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "mintLicenseTokenAndRegisterDerivative",
    values: [AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "mintPrice", values?: undefined): string;
  encodeFunctionData(functionFragment: "mintedTweet", values: [string]): string;
  encodeFunctionData(
    functionFragment: "minters",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ownerOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "royaltyInfo",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "safeMint",
    values: [
      AddressLike,
      string,
      string,
      string,
      string,
      boolean,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      string[],
      string[],
      string,
      string,
      string,
      string
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom(address,address,uint256)",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom(address,address,uint256,bytes)",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setApprovalForAll",
    values: [AddressLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setMintPrice",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMinter",
    values: [AddressLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenByIndex",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenOfOwnerByIndex",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tweetMetadata",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "CURRENCY_TOKEN",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "IP_ASSET_REGISTRY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "LICENSE_REGISTRY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "LICENSING_MODULE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "METADATA_MODULE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PIL_TEMPLATE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ROYALTY_POLICY_LAP",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getApproved",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTweetMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isApprovedForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "maxSupply", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "mintAndRegisterAndCreateTermsAndAttach",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintLicenseTokenAndRegisterDerivative",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mintPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "mintedTweet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "minters", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ownerOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "royaltyInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "safeMint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom(address,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom(address,address,uint256,bytes)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setApprovalForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMintPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setMinter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenByIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenOfOwnerByIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tweetMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [
    owner: AddressLike,
    approved: AddressLike,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [owner: string, approved: string, tokenId: bigint];
  export interface OutputObject {
    owner: string;
    approved: string;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ApprovalForAllEvent {
  export type InputTuple = [
    owner: AddressLike,
    operator: AddressLike,
    approved: boolean
  ];
  export type OutputTuple = [
    owner: string,
    operator: string,
    approved: boolean
  ];
  export interface OutputObject {
    owner: string;
    operator: string;
    approved: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DerivativeRegisteredEvent {
  export type InputTuple = [
    tokenId: BigNumberish,
    ipId: AddressLike,
    licenseTokenId: BigNumberish
  ];
  export type OutputTuple = [
    tokenId: bigint,
    ipId: string,
    licenseTokenId: bigint
  ];
  export interface OutputObject {
    tokenId: bigint;
    ipId: string;
    licenseTokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TermsCreatedAndAttachedEvent {
  export type InputTuple = [
    tokenId: BigNumberish,
    ipId: AddressLike,
    licenseTermsId: BigNumberish
  ];
  export type OutputTuple = [
    tokenId: bigint,
    ipId: string,
    licenseTermsId: bigint
  ];
  export interface OutputObject {
    tokenId: bigint;
    ipId: string;
    licenseTermsId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, tokenId: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TweetMintedEvent {
  export type InputTuple = [
    tokenId: BigNumberish,
    tweetId: string,
    name: string,
    handle: string,
    timestamp: string,
    verified: boolean,
    comments: BigNumberish,
    retweets: BigNumberish,
    likes: BigNumberish,
    analytics: BigNumberish,
    tags: string[],
    mentions: string[],
    profileImage: string,
    tweetLink: string,
    ipfsScreenshot: string
  ];
  export type OutputTuple = [
    tokenId: bigint,
    tweetId: string,
    name: string,
    handle: string,
    timestamp: string,
    verified: boolean,
    comments: bigint,
    retweets: bigint,
    likes: bigint,
    analytics: bigint,
    tags: string[],
    mentions: string[],
    profileImage: string,
    tweetLink: string,
    ipfsScreenshot: string
  ];
  export interface OutputObject {
    tokenId: bigint;
    tweetId: string;
    name: string;
    handle: string;
    timestamp: string;
    verified: boolean;
    comments: bigint;
    retweets: bigint;
    likes: bigint;
    analytics: bigint;
    tags: string[];
    mentions: string[];
    profileImage: string;
    tweetLink: string;
    ipfsScreenshot: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TweetRegisteredEvent {
  export type InputTuple = [
    tokenId: BigNumberish,
    tweetId: string,
    owner: AddressLike,
    ipId: AddressLike
  ];
  export type OutputTuple = [
    tokenId: bigint,
    tweetId: string,
    owner: string,
    ipId: string
  ];
  export interface OutputObject {
    tokenId: bigint;
    tweetId: string;
    owner: string;
    ipId: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnpausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface StoryNFT extends BaseContract {
  connect(runner?: ContractRunner | null): StoryNFT;
  waitForDeployment(): Promise<this>;

  interface: StoryNFTInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  CURRENCY_TOKEN: TypedContractMethod<[], [string], "view">;

  IP_ASSET_REGISTRY: TypedContractMethod<[], [string], "view">;

  LICENSE_REGISTRY: TypedContractMethod<[], [string], "view">;

  LICENSING_MODULE: TypedContractMethod<[], [string], "view">;

  METADATA_MODULE: TypedContractMethod<[], [string], "view">;

  PIL_TEMPLATE: TypedContractMethod<[], [string], "view">;

  ROYALTY_POLICY_LAP: TypedContractMethod<[], [string], "view">;

  approve: TypedContractMethod<
    [to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  balanceOf: TypedContractMethod<[owner: AddressLike], [bigint], "view">;

  getApproved: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  getTweetMetadata: TypedContractMethod<
    [tokenId: BigNumberish],
    [StoryNFT.TweetMetadataStructOutput],
    "view"
  >;

  isApprovedForAll: TypedContractMethod<
    [owner: AddressLike, operator: AddressLike],
    [boolean],
    "view"
  >;

  maxSupply: TypedContractMethod<[], [bigint], "view">;

  mintAndRegisterAndCreateTermsAndAttach: TypedContractMethod<
    [receiver: AddressLike],
    [
      [bigint, string, bigint] & {
        tokenId: bigint;
        ipId: string;
        licenseTermsId: bigint;
      }
    ],
    "nonpayable"
  >;

  mintLicenseTokenAndRegisterDerivative: TypedContractMethod<
    [
      parentIpId: AddressLike,
      licenseTermsId: BigNumberish,
      receiver: AddressLike
    ],
    [
      [bigint, string, bigint] & {
        childTokenId: bigint;
        childIpId: string;
        licenseTokenId: bigint;
      }
    ],
    "nonpayable"
  >;

  mintPrice: TypedContractMethod<[], [bigint], "view">;

  mintedTweet: TypedContractMethod<[arg0: string], [boolean], "view">;

  minters: TypedContractMethod<[arg0: AddressLike], [boolean], "view">;

  name: TypedContractMethod<[], [string], "view">;

  onERC721Received: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  ownerOf: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  pause: TypedContractMethod<[], [void], "nonpayable">;

  paused: TypedContractMethod<[], [boolean], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  royaltyInfo: TypedContractMethod<
    [_tokenId: BigNumberish, _salePrice: BigNumberish],
    [[string, bigint]],
    "view"
  >;

  safeMint: TypedContractMethod<
    [
      to: AddressLike,
      uri: string,
      name_: string,
      handle_: string,
      timestamp_: string,
      verified_: boolean,
      comments_: BigNumberish,
      retweets_: BigNumberish,
      likes_: BigNumberish,
      analytics_: BigNumberish,
      tags_: string[],
      mentions_: string[],
      profileImage_: string,
      tweetLink_: string,
      tweetId_: string,
      ipfsScreenshot_: string
    ],
    [void],
    "nonpayable"
  >;

  "safeTransferFrom(address,address,uint256)": TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  "safeTransferFrom(address,address,uint256,bytes)": TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      tokenId: BigNumberish,
      data: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  setApprovalForAll: TypedContractMethod<
    [operator: AddressLike, approved: boolean],
    [void],
    "nonpayable"
  >;

  setMintPrice: TypedContractMethod<[p: BigNumberish], [void], "nonpayable">;

  setMinter: TypedContractMethod<
    [who: AddressLike, allowed: boolean],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  symbol: TypedContractMethod<[], [string], "view">;

  tokenByIndex: TypedContractMethod<[index: BigNumberish], [bigint], "view">;

  tokenOfOwnerByIndex: TypedContractMethod<
    [owner: AddressLike, index: BigNumberish],
    [bigint],
    "view"
  >;

  tokenURI: TypedContractMethod<[id: BigNumberish], [string], "view">;

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  transferFrom: TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  tweetMetadata: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [
        string,
        string,
        string,
        boolean,
        bigint,
        bigint,
        bigint,
        bigint,
        string,
        string,
        string,
        string
      ] & {
        name: string;
        handle: string;
        timestamp: string;
        verified: boolean;
        comments: bigint;
        retweets: bigint;
        likes: bigint;
        analytics: bigint;
        profileImage: string;
        tweetLink: string;
        tweetId: string;
        ipfsScreenshot: string;
      }
    ],
    "view"
  >;

  unpause: TypedContractMethod<[], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "CURRENCY_TOKEN"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "IP_ASSET_REGISTRY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "LICENSE_REGISTRY"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "LICENSING_MODULE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "METADATA_MODULE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "PIL_TEMPLATE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ROYALTY_POLICY_LAP"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "approve"
  ): TypedContractMethod<
    [to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[owner: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getApproved"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "getTweetMetadata"
  ): TypedContractMethod<
    [tokenId: BigNumberish],
    [StoryNFT.TweetMetadataStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "isApprovedForAll"
  ): TypedContractMethod<
    [owner: AddressLike, operator: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "maxSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "mintAndRegisterAndCreateTermsAndAttach"
  ): TypedContractMethod<
    [receiver: AddressLike],
    [
      [bigint, string, bigint] & {
        tokenId: bigint;
        ipId: string;
        licenseTermsId: bigint;
      }
    ],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "mintLicenseTokenAndRegisterDerivative"
  ): TypedContractMethod<
    [
      parentIpId: AddressLike,
      licenseTermsId: BigNumberish,
      receiver: AddressLike
    ],
    [
      [bigint, string, bigint] & {
        childTokenId: bigint;
        childIpId: string;
        licenseTokenId: bigint;
      }
    ],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "mintPrice"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "mintedTweet"
  ): TypedContractMethod<[arg0: string], [boolean], "view">;
  getFunction(
    nameOrSignature: "minters"
  ): TypedContractMethod<[arg0: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "onERC721Received"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ownerOf"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "pause"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "paused"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "royaltyInfo"
  ): TypedContractMethod<
    [_tokenId: BigNumberish, _salePrice: BigNumberish],
    [[string, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "safeMint"
  ): TypedContractMethod<
    [
      to: AddressLike,
      uri: string,
      name_: string,
      handle_: string,
      timestamp_: string,
      verified_: boolean,
      comments_: BigNumberish,
      retweets_: BigNumberish,
      likes_: BigNumberish,
      analytics_: BigNumberish,
      tags_: string[],
      mentions_: string[],
      profileImage_: string,
      tweetLink_: string,
      tweetId_: string,
      ipfsScreenshot_: string
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "safeTransferFrom(address,address,uint256)"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "safeTransferFrom(address,address,uint256,bytes)"
  ): TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      tokenId: BigNumberish,
      data: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setApprovalForAll"
  ): TypedContractMethod<
    [operator: AddressLike, approved: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setMintPrice"
  ): TypedContractMethod<[p: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setMinter"
  ): TypedContractMethod<
    [who: AddressLike, allowed: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "tokenByIndex"
  ): TypedContractMethod<[index: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "tokenOfOwnerByIndex"
  ): TypedContractMethod<
    [owner: AddressLike, index: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "tokenURI"
  ): TypedContractMethod<[id: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "tweetMetadata"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [
        string,
        string,
        string,
        boolean,
        bigint,
        bigint,
        bigint,
        bigint,
        string,
        string,
        string,
        string
      ] & {
        name: string;
        handle: string;
        timestamp: string;
        verified: boolean;
        comments: bigint;
        retweets: bigint;
        likes: bigint;
        analytics: bigint;
        profileImage: string;
        tweetLink: string;
        tweetId: string;
        ipfsScreenshot: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "unpause"
  ): TypedContractMethod<[], [void], "nonpayable">;

  getEvent(
    key: "Approval"
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: "ApprovalForAll"
  ): TypedContractEvent<
    ApprovalForAllEvent.InputTuple,
    ApprovalForAllEvent.OutputTuple,
    ApprovalForAllEvent.OutputObject
  >;
  getEvent(
    key: "DerivativeRegistered"
  ): TypedContractEvent<
    DerivativeRegisteredEvent.InputTuple,
    DerivativeRegisteredEvent.OutputTuple,
    DerivativeRegisteredEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Paused"
  ): TypedContractEvent<
    PausedEvent.InputTuple,
    PausedEvent.OutputTuple,
    PausedEvent.OutputObject
  >;
  getEvent(
    key: "TermsCreatedAndAttached"
  ): TypedContractEvent<
    TermsCreatedAndAttachedEvent.InputTuple,
    TermsCreatedAndAttachedEvent.OutputTuple,
    TermsCreatedAndAttachedEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;
  getEvent(
    key: "TweetMinted"
  ): TypedContractEvent<
    TweetMintedEvent.InputTuple,
    TweetMintedEvent.OutputTuple,
    TweetMintedEvent.OutputObject
  >;
  getEvent(
    key: "TweetRegistered"
  ): TypedContractEvent<
    TweetRegisteredEvent.InputTuple,
    TweetRegisteredEvent.OutputTuple,
    TweetRegisteredEvent.OutputObject
  >;
  getEvent(
    key: "Unpaused"
  ): TypedContractEvent<
    UnpausedEvent.InputTuple,
    UnpausedEvent.OutputTuple,
    UnpausedEvent.OutputObject
  >;

  filters: {
    "Approval(address,address,uint256)": TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    "ApprovalForAll(address,address,bool)": TypedContractEvent<
      ApprovalForAllEvent.InputTuple,
      ApprovalForAllEvent.OutputTuple,
      ApprovalForAllEvent.OutputObject
    >;
    ApprovalForAll: TypedContractEvent<
      ApprovalForAllEvent.InputTuple,
      ApprovalForAllEvent.OutputTuple,
      ApprovalForAllEvent.OutputObject
    >;

    "DerivativeRegistered(uint256,address,uint256)": TypedContractEvent<
      DerivativeRegisteredEvent.InputTuple,
      DerivativeRegisteredEvent.OutputTuple,
      DerivativeRegisteredEvent.OutputObject
    >;
    DerivativeRegistered: TypedContractEvent<
      DerivativeRegisteredEvent.InputTuple,
      DerivativeRegisteredEvent.OutputTuple,
      DerivativeRegisteredEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "Paused(address)": TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;
    Paused: TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;

    "TermsCreatedAndAttached(uint256,address,uint256)": TypedContractEvent<
      TermsCreatedAndAttachedEvent.InputTuple,
      TermsCreatedAndAttachedEvent.OutputTuple,
      TermsCreatedAndAttachedEvent.OutputObject
    >;
    TermsCreatedAndAttached: TypedContractEvent<
      TermsCreatedAndAttachedEvent.InputTuple,
      TermsCreatedAndAttachedEvent.OutputTuple,
      TermsCreatedAndAttachedEvent.OutputObject
    >;

    "Transfer(address,address,uint256)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;

    "TweetMinted(uint256,string,string,string,string,bool,uint256,uint256,uint256,uint256,string[],string[],string,string,string)": TypedContractEvent<
      TweetMintedEvent.InputTuple,
      TweetMintedEvent.OutputTuple,
      TweetMintedEvent.OutputObject
    >;
    TweetMinted: TypedContractEvent<
      TweetMintedEvent.InputTuple,
      TweetMintedEvent.OutputTuple,
      TweetMintedEvent.OutputObject
    >;

    "TweetRegistered(uint256,string,address,address)": TypedContractEvent<
      TweetRegisteredEvent.InputTuple,
      TweetRegisteredEvent.OutputTuple,
      TweetRegisteredEvent.OutputObject
    >;
    TweetRegistered: TypedContractEvent<
      TweetRegisteredEvent.InputTuple,
      TweetRegisteredEvent.OutputTuple,
      TweetRegisteredEvent.OutputObject
    >;

    "Unpaused(address)": TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
    Unpaused: TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
  };
}
