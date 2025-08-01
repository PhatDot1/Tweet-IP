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
} from "../../../../common";

export interface IGroupingModuleInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "addIp"
      | "claimReward"
      | "collectRoyalties"
      | "getClaimableReward"
      | "name"
      | "registerGroup"
      | "removeIp"
      | "supportsInterface"
      | "whitelistGroupRewardPool"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AddedIpToGroup"
      | "ClaimedReward"
      | "CollectedRoyaltiesToGroupPool"
      | "IPGroupRegistered"
      | "RemovedIpFromGroup"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "addIp",
    values: [AddressLike, AddressLike[], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "claimReward",
    values: [AddressLike, AddressLike, AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "collectRoyalties",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getClaimableReward",
    values: [AddressLike, AddressLike, AddressLike[]]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "registerGroup",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "removeIp",
    values: [AddressLike, AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistGroupRewardPool",
    values: [AddressLike, boolean]
  ): string;

  decodeFunctionResult(functionFragment: "addIp", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "collectRoyalties",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClaimableReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "registerGroup",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "removeIp", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "whitelistGroupRewardPool",
    data: BytesLike
  ): Result;
}

export namespace AddedIpToGroupEvent {
  export type InputTuple = [groupId: AddressLike, ipIds: AddressLike[]];
  export type OutputTuple = [groupId: string, ipIds: string[]];
  export interface OutputObject {
    groupId: string;
    ipIds: string[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ClaimedRewardEvent {
  export type InputTuple = [
    groupId: AddressLike,
    token: AddressLike,
    ipId: AddressLike[],
    amount: BigNumberish[]
  ];
  export type OutputTuple = [
    groupId: string,
    token: string,
    ipId: string[],
    amount: bigint[]
  ];
  export interface OutputObject {
    groupId: string;
    token: string;
    ipId: string[];
    amount: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CollectedRoyaltiesToGroupPoolEvent {
  export type InputTuple = [
    groupId: AddressLike,
    token: AddressLike,
    pool: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [
    groupId: string,
    token: string,
    pool: string,
    amount: bigint
  ];
  export interface OutputObject {
    groupId: string;
    token: string;
    pool: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace IPGroupRegisteredEvent {
  export type InputTuple = [groupId: AddressLike, groupPool: AddressLike];
  export type OutputTuple = [groupId: string, groupPool: string];
  export interface OutputObject {
    groupId: string;
    groupPool: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RemovedIpFromGroupEvent {
  export type InputTuple = [groupId: AddressLike, ipIds: AddressLike[]];
  export type OutputTuple = [groupId: string, ipIds: string[]];
  export interface OutputObject {
    groupId: string;
    ipIds: string[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IGroupingModule extends BaseContract {
  connect(runner?: ContractRunner | null): IGroupingModule;
  waitForDeployment(): Promise<this>;

  interface: IGroupingModuleInterface;

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

  addIp: TypedContractMethod<
    [
      groupIpId: AddressLike,
      ipIds: AddressLike[],
      maxAllowedRewardShare: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  claimReward: TypedContractMethod<
    [groupId: AddressLike, token: AddressLike, ipIds: AddressLike[]],
    [void],
    "nonpayable"
  >;

  collectRoyalties: TypedContractMethod<
    [groupId: AddressLike, token: AddressLike],
    [bigint],
    "nonpayable"
  >;

  getClaimableReward: TypedContractMethod<
    [groupId: AddressLike, token: AddressLike, ipIds: AddressLike[]],
    [bigint[]],
    "view"
  >;

  name: TypedContractMethod<[], [string], "nonpayable">;

  registerGroup: TypedContractMethod<
    [groupPool: AddressLike],
    [string],
    "nonpayable"
  >;

  removeIp: TypedContractMethod<
    [groupIpId: AddressLike, ipIds: AddressLike[]],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  whitelistGroupRewardPool: TypedContractMethod<
    [rewardPool: AddressLike, allowed: boolean],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addIp"
  ): TypedContractMethod<
    [
      groupIpId: AddressLike,
      ipIds: AddressLike[],
      maxAllowedRewardShare: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "claimReward"
  ): TypedContractMethod<
    [groupId: AddressLike, token: AddressLike, ipIds: AddressLike[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "collectRoyalties"
  ): TypedContractMethod<
    [groupId: AddressLike, token: AddressLike],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getClaimableReward"
  ): TypedContractMethod<
    [groupId: AddressLike, token: AddressLike, ipIds: AddressLike[]],
    [bigint[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "nonpayable">;
  getFunction(
    nameOrSignature: "registerGroup"
  ): TypedContractMethod<[groupPool: AddressLike], [string], "nonpayable">;
  getFunction(
    nameOrSignature: "removeIp"
  ): TypedContractMethod<
    [groupIpId: AddressLike, ipIds: AddressLike[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "whitelistGroupRewardPool"
  ): TypedContractMethod<
    [rewardPool: AddressLike, allowed: boolean],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "AddedIpToGroup"
  ): TypedContractEvent<
    AddedIpToGroupEvent.InputTuple,
    AddedIpToGroupEvent.OutputTuple,
    AddedIpToGroupEvent.OutputObject
  >;
  getEvent(
    key: "ClaimedReward"
  ): TypedContractEvent<
    ClaimedRewardEvent.InputTuple,
    ClaimedRewardEvent.OutputTuple,
    ClaimedRewardEvent.OutputObject
  >;
  getEvent(
    key: "CollectedRoyaltiesToGroupPool"
  ): TypedContractEvent<
    CollectedRoyaltiesToGroupPoolEvent.InputTuple,
    CollectedRoyaltiesToGroupPoolEvent.OutputTuple,
    CollectedRoyaltiesToGroupPoolEvent.OutputObject
  >;
  getEvent(
    key: "IPGroupRegistered"
  ): TypedContractEvent<
    IPGroupRegisteredEvent.InputTuple,
    IPGroupRegisteredEvent.OutputTuple,
    IPGroupRegisteredEvent.OutputObject
  >;
  getEvent(
    key: "RemovedIpFromGroup"
  ): TypedContractEvent<
    RemovedIpFromGroupEvent.InputTuple,
    RemovedIpFromGroupEvent.OutputTuple,
    RemovedIpFromGroupEvent.OutputObject
  >;

  filters: {
    "AddedIpToGroup(address,address[])": TypedContractEvent<
      AddedIpToGroupEvent.InputTuple,
      AddedIpToGroupEvent.OutputTuple,
      AddedIpToGroupEvent.OutputObject
    >;
    AddedIpToGroup: TypedContractEvent<
      AddedIpToGroupEvent.InputTuple,
      AddedIpToGroupEvent.OutputTuple,
      AddedIpToGroupEvent.OutputObject
    >;

    "ClaimedReward(address,address,address[],uint256[])": TypedContractEvent<
      ClaimedRewardEvent.InputTuple,
      ClaimedRewardEvent.OutputTuple,
      ClaimedRewardEvent.OutputObject
    >;
    ClaimedReward: TypedContractEvent<
      ClaimedRewardEvent.InputTuple,
      ClaimedRewardEvent.OutputTuple,
      ClaimedRewardEvent.OutputObject
    >;

    "CollectedRoyaltiesToGroupPool(address,address,address,uint256)": TypedContractEvent<
      CollectedRoyaltiesToGroupPoolEvent.InputTuple,
      CollectedRoyaltiesToGroupPoolEvent.OutputTuple,
      CollectedRoyaltiesToGroupPoolEvent.OutputObject
    >;
    CollectedRoyaltiesToGroupPool: TypedContractEvent<
      CollectedRoyaltiesToGroupPoolEvent.InputTuple,
      CollectedRoyaltiesToGroupPoolEvent.OutputTuple,
      CollectedRoyaltiesToGroupPoolEvent.OutputObject
    >;

    "IPGroupRegistered(address,address)": TypedContractEvent<
      IPGroupRegisteredEvent.InputTuple,
      IPGroupRegisteredEvent.OutputTuple,
      IPGroupRegisteredEvent.OutputObject
    >;
    IPGroupRegistered: TypedContractEvent<
      IPGroupRegisteredEvent.InputTuple,
      IPGroupRegisteredEvent.OutputTuple,
      IPGroupRegisteredEvent.OutputObject
    >;

    "RemovedIpFromGroup(address,address[])": TypedContractEvent<
      RemovedIpFromGroupEvent.InputTuple,
      RemovedIpFromGroupEvent.OutputTuple,
      RemovedIpFromGroupEvent.OutputObject
    >;
    RemovedIpFromGroup: TypedContractEvent<
      RemovedIpFromGroupEvent.InputTuple,
      RemovedIpFromGroupEvent.OutputTuple,
      RemovedIpFromGroupEvent.OutputObject
    >;
  };
}
