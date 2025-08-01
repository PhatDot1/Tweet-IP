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
} from "../../../../../common";

export interface IIpRoyaltyVaultInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "claimByTokenBatchAsSelf"
      | "claimRevenueOnBehalf"
      | "claimRevenueOnBehalfByTokenBatch"
      | "claimableRevenue"
      | "claimerRevenueDebt"
      | "initialize"
      | "ipId"
      | "tokens"
      | "updateVaultBalance"
      | "vaultAccBalances"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "RevenueDebtUpdated"
      | "RevenueTokenAddedToVault"
      | "RevenueTokenClaimed"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "claimByTokenBatchAsSelf",
    values: [AddressLike[], AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "claimRevenueOnBehalf",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "claimRevenueOnBehalfByTokenBatch",
    values: [AddressLike, AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "claimableRevenue",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "claimerRevenueDebt",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string, BigNumberish, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "ipId", values?: undefined): string;
  encodeFunctionData(functionFragment: "tokens", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "updateVaultBalance",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "vaultAccBalances",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "claimByTokenBatchAsSelf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimRevenueOnBehalf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimRevenueOnBehalfByTokenBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimableRevenue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimerRevenueDebt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ipId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updateVaultBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "vaultAccBalances",
    data: BytesLike
  ): Result;
}

export namespace RevenueDebtUpdatedEvent {
  export type InputTuple = [
    claimer: AddressLike,
    token: AddressLike,
    revenueDebt: BigNumberish
  ];
  export type OutputTuple = [
    claimer: string,
    token: string,
    revenueDebt: bigint
  ];
  export interface OutputObject {
    claimer: string;
    token: string;
    revenueDebt: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RevenueTokenAddedToVaultEvent {
  export type InputTuple = [token: AddressLike, amount: BigNumberish];
  export type OutputTuple = [token: string, amount: bigint];
  export interface OutputObject {
    token: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RevenueTokenClaimedEvent {
  export type InputTuple = [
    claimer: AddressLike,
    token: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [claimer: string, token: string, amount: bigint];
  export interface OutputObject {
    claimer: string;
    token: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IIpRoyaltyVault extends BaseContract {
  connect(runner?: ContractRunner | null): IIpRoyaltyVault;
  waitForDeployment(): Promise<this>;

  interface: IIpRoyaltyVaultInterface;

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

  claimByTokenBatchAsSelf: TypedContractMethod<
    [tokenList: AddressLike[], targetIpId: AddressLike],
    [void],
    "nonpayable"
  >;

  claimRevenueOnBehalf: TypedContractMethod<
    [claimer: AddressLike, token: AddressLike],
    [bigint],
    "nonpayable"
  >;

  claimRevenueOnBehalfByTokenBatch: TypedContractMethod<
    [claimer: AddressLike, tokenList: AddressLike[]],
    [bigint[]],
    "nonpayable"
  >;

  claimableRevenue: TypedContractMethod<
    [claimer: AddressLike, token: AddressLike],
    [bigint],
    "view"
  >;

  claimerRevenueDebt: TypedContractMethod<
    [claimer: AddressLike, token: AddressLike],
    [bigint],
    "view"
  >;

  initialize: TypedContractMethod<
    [
      name: string,
      symbol: string,
      supply: BigNumberish,
      ipIdAddress: AddressLike,
      rtReceiver: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  ipId: TypedContractMethod<[], [string], "view">;

  tokens: TypedContractMethod<[], [string[]], "view">;

  updateVaultBalance: TypedContractMethod<
    [token: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  vaultAccBalances: TypedContractMethod<[token: AddressLike], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "claimByTokenBatchAsSelf"
  ): TypedContractMethod<
    [tokenList: AddressLike[], targetIpId: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "claimRevenueOnBehalf"
  ): TypedContractMethod<
    [claimer: AddressLike, token: AddressLike],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "claimRevenueOnBehalfByTokenBatch"
  ): TypedContractMethod<
    [claimer: AddressLike, tokenList: AddressLike[]],
    [bigint[]],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "claimableRevenue"
  ): TypedContractMethod<
    [claimer: AddressLike, token: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "claimerRevenueDebt"
  ): TypedContractMethod<
    [claimer: AddressLike, token: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [
      name: string,
      symbol: string,
      supply: BigNumberish,
      ipIdAddress: AddressLike,
      rtReceiver: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "ipId"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "tokens"
  ): TypedContractMethod<[], [string[]], "view">;
  getFunction(
    nameOrSignature: "updateVaultBalance"
  ): TypedContractMethod<
    [token: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "vaultAccBalances"
  ): TypedContractMethod<[token: AddressLike], [bigint], "view">;

  getEvent(
    key: "RevenueDebtUpdated"
  ): TypedContractEvent<
    RevenueDebtUpdatedEvent.InputTuple,
    RevenueDebtUpdatedEvent.OutputTuple,
    RevenueDebtUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "RevenueTokenAddedToVault"
  ): TypedContractEvent<
    RevenueTokenAddedToVaultEvent.InputTuple,
    RevenueTokenAddedToVaultEvent.OutputTuple,
    RevenueTokenAddedToVaultEvent.OutputObject
  >;
  getEvent(
    key: "RevenueTokenClaimed"
  ): TypedContractEvent<
    RevenueTokenClaimedEvent.InputTuple,
    RevenueTokenClaimedEvent.OutputTuple,
    RevenueTokenClaimedEvent.OutputObject
  >;

  filters: {
    "RevenueDebtUpdated(address,address,int256)": TypedContractEvent<
      RevenueDebtUpdatedEvent.InputTuple,
      RevenueDebtUpdatedEvent.OutputTuple,
      RevenueDebtUpdatedEvent.OutputObject
    >;
    RevenueDebtUpdated: TypedContractEvent<
      RevenueDebtUpdatedEvent.InputTuple,
      RevenueDebtUpdatedEvent.OutputTuple,
      RevenueDebtUpdatedEvent.OutputObject
    >;

    "RevenueTokenAddedToVault(address,uint256)": TypedContractEvent<
      RevenueTokenAddedToVaultEvent.InputTuple,
      RevenueTokenAddedToVaultEvent.OutputTuple,
      RevenueTokenAddedToVaultEvent.OutputObject
    >;
    RevenueTokenAddedToVault: TypedContractEvent<
      RevenueTokenAddedToVaultEvent.InputTuple,
      RevenueTokenAddedToVaultEvent.OutputTuple,
      RevenueTokenAddedToVaultEvent.OutputObject
    >;

    "RevenueTokenClaimed(address,address,uint256)": TypedContractEvent<
      RevenueTokenClaimedEvent.InputTuple,
      RevenueTokenClaimedEvent.OutputTuple,
      RevenueTokenClaimedEvent.OutputObject
    >;
    RevenueTokenClaimed: TypedContractEvent<
      RevenueTokenClaimedEvent.InputTuple,
      RevenueTokenClaimedEvent.OutputTuple,
      RevenueTokenClaimedEvent.OutputObject
    >;
  };
}
