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

export declare namespace Licensing {
  export type LicensingConfigStruct = {
    isSet: boolean;
    mintingFee: BigNumberish;
    licensingHook: AddressLike;
    hookData: BytesLike;
    commercialRevShare: BigNumberish;
    disabled: boolean;
    expectMinimumGroupRewardShare: BigNumberish;
    expectGroupRewardPool: AddressLike;
  };

  export type LicensingConfigStructOutput = [
    isSet: boolean,
    mintingFee: bigint,
    licensingHook: string,
    hookData: string,
    commercialRevShare: bigint,
    disabled: boolean,
    expectMinimumGroupRewardShare: bigint,
    expectGroupRewardPool: string
  ] & {
    isSet: boolean;
    mintingFee: bigint;
    licensingHook: string;
    hookData: string;
    commercialRevShare: bigint;
    disabled: boolean;
    expectMinimumGroupRewardShare: bigint;
    expectGroupRewardPool: string;
  };
}

export interface ILicensingModuleInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "attachDefaultLicenseTerms"
      | "attachLicenseTerms"
      | "mintLicenseTokens"
      | "name"
      | "predictMintingLicenseFee"
      | "registerDerivative"
      | "registerDerivativeWithLicenseTokens"
      | "setLicensingConfig"
      | "supportsInterface"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "DerivativeRegistered"
      | "LicenseTermsAttached"
      | "LicenseTokensMinted"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "attachDefaultLicenseTerms",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "attachLicenseTerms",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mintLicenseTokens",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      BytesLike,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "predictMintingLicenseFee",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerDerivative",
    values: [
      AddressLike,
      AddressLike[],
      BigNumberish[],
      AddressLike,
      BytesLike,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerDerivativeWithLicenseTokens",
    values: [AddressLike, BigNumberish[], BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setLicensingConfig",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      Licensing.LicensingConfigStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "attachDefaultLicenseTerms",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "attachLicenseTerms",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintLicenseTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "predictMintingLicenseFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerDerivative",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerDerivativeWithLicenseTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLicensingConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
}

export namespace DerivativeRegisteredEvent {
  export type InputTuple = [
    caller: AddressLike,
    childIpId: AddressLike,
    licenseTokenIds: BigNumberish[],
    parentIpIds: AddressLike[],
    licenseTermsIds: BigNumberish[],
    licenseTemplate: AddressLike
  ];
  export type OutputTuple = [
    caller: string,
    childIpId: string,
    licenseTokenIds: bigint[],
    parentIpIds: string[],
    licenseTermsIds: bigint[],
    licenseTemplate: string
  ];
  export interface OutputObject {
    caller: string;
    childIpId: string;
    licenseTokenIds: bigint[];
    parentIpIds: string[];
    licenseTermsIds: bigint[];
    licenseTemplate: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace LicenseTermsAttachedEvent {
  export type InputTuple = [
    caller: AddressLike,
    ipId: AddressLike,
    licenseTemplate: AddressLike,
    licenseTermsId: BigNumberish
  ];
  export type OutputTuple = [
    caller: string,
    ipId: string,
    licenseTemplate: string,
    licenseTermsId: bigint
  ];
  export interface OutputObject {
    caller: string;
    ipId: string;
    licenseTemplate: string;
    licenseTermsId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace LicenseTokensMintedEvent {
  export type InputTuple = [
    caller: AddressLike,
    licensorIpId: AddressLike,
    licenseTemplate: AddressLike,
    licenseTermsId: BigNumberish,
    amount: BigNumberish,
    receiver: AddressLike,
    startLicenseTokenId: BigNumberish
  ];
  export type OutputTuple = [
    caller: string,
    licensorIpId: string,
    licenseTemplate: string,
    licenseTermsId: bigint,
    amount: bigint,
    receiver: string,
    startLicenseTokenId: bigint
  ];
  export interface OutputObject {
    caller: string;
    licensorIpId: string;
    licenseTemplate: string;
    licenseTermsId: bigint;
    amount: bigint;
    receiver: string;
    startLicenseTokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ILicensingModule extends BaseContract {
  connect(runner?: ContractRunner | null): ILicensingModule;
  waitForDeployment(): Promise<this>;

  interface: ILicensingModuleInterface;

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

  attachDefaultLicenseTerms: TypedContractMethod<
    [ipId: AddressLike],
    [void],
    "nonpayable"
  >;

  attachLicenseTerms: TypedContractMethod<
    [
      ipId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  mintLicenseTokens: TypedContractMethod<
    [
      licensorIpId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish,
      amount: BigNumberish,
      receiver: AddressLike,
      royaltyContext: BytesLike,
      maxMintingFee: BigNumberish,
      maxRevenueShare: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  name: TypedContractMethod<[], [string], "nonpayable">;

  predictMintingLicenseFee: TypedContractMethod<
    [
      licensorIpId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish,
      amount: BigNumberish,
      receiver: AddressLike,
      royaltyContext: BytesLike
    ],
    [[string, bigint] & { currencyToken: string; tokenAmount: bigint }],
    "view"
  >;

  registerDerivative: TypedContractMethod<
    [
      childIpId: AddressLike,
      parentIpIds: AddressLike[],
      licenseTermsIds: BigNumberish[],
      licenseTemplate: AddressLike,
      royaltyContext: BytesLike,
      maxMintingFee: BigNumberish,
      maxRts: BigNumberish,
      maxRevenueShare: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  registerDerivativeWithLicenseTokens: TypedContractMethod<
    [
      childIpId: AddressLike,
      licenseTokenIds: BigNumberish[],
      royaltyContext: BytesLike,
      maxRts: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  setLicensingConfig: TypedContractMethod<
    [
      ipId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish,
      licensingConfig: Licensing.LicensingConfigStruct
    ],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "attachDefaultLicenseTerms"
  ): TypedContractMethod<[ipId: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "attachLicenseTerms"
  ): TypedContractMethod<
    [
      ipId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "mintLicenseTokens"
  ): TypedContractMethod<
    [
      licensorIpId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish,
      amount: BigNumberish,
      receiver: AddressLike,
      royaltyContext: BytesLike,
      maxMintingFee: BigNumberish,
      maxRevenueShare: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "nonpayable">;
  getFunction(
    nameOrSignature: "predictMintingLicenseFee"
  ): TypedContractMethod<
    [
      licensorIpId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish,
      amount: BigNumberish,
      receiver: AddressLike,
      royaltyContext: BytesLike
    ],
    [[string, bigint] & { currencyToken: string; tokenAmount: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "registerDerivative"
  ): TypedContractMethod<
    [
      childIpId: AddressLike,
      parentIpIds: AddressLike[],
      licenseTermsIds: BigNumberish[],
      licenseTemplate: AddressLike,
      royaltyContext: BytesLike,
      maxMintingFee: BigNumberish,
      maxRts: BigNumberish,
      maxRevenueShare: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "registerDerivativeWithLicenseTokens"
  ): TypedContractMethod<
    [
      childIpId: AddressLike,
      licenseTokenIds: BigNumberish[],
      royaltyContext: BytesLike,
      maxRts: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setLicensingConfig"
  ): TypedContractMethod<
    [
      ipId: AddressLike,
      licenseTemplate: AddressLike,
      licenseTermsId: BigNumberish,
      licensingConfig: Licensing.LicensingConfigStruct
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;

  getEvent(
    key: "DerivativeRegistered"
  ): TypedContractEvent<
    DerivativeRegisteredEvent.InputTuple,
    DerivativeRegisteredEvent.OutputTuple,
    DerivativeRegisteredEvent.OutputObject
  >;
  getEvent(
    key: "LicenseTermsAttached"
  ): TypedContractEvent<
    LicenseTermsAttachedEvent.InputTuple,
    LicenseTermsAttachedEvent.OutputTuple,
    LicenseTermsAttachedEvent.OutputObject
  >;
  getEvent(
    key: "LicenseTokensMinted"
  ): TypedContractEvent<
    LicenseTokensMintedEvent.InputTuple,
    LicenseTokensMintedEvent.OutputTuple,
    LicenseTokensMintedEvent.OutputObject
  >;

  filters: {
    "DerivativeRegistered(address,address,uint256[],address[],uint256[],address)": TypedContractEvent<
      DerivativeRegisteredEvent.InputTuple,
      DerivativeRegisteredEvent.OutputTuple,
      DerivativeRegisteredEvent.OutputObject
    >;
    DerivativeRegistered: TypedContractEvent<
      DerivativeRegisteredEvent.InputTuple,
      DerivativeRegisteredEvent.OutputTuple,
      DerivativeRegisteredEvent.OutputObject
    >;

    "LicenseTermsAttached(address,address,address,uint256)": TypedContractEvent<
      LicenseTermsAttachedEvent.InputTuple,
      LicenseTermsAttachedEvent.OutputTuple,
      LicenseTermsAttachedEvent.OutputObject
    >;
    LicenseTermsAttached: TypedContractEvent<
      LicenseTermsAttachedEvent.InputTuple,
      LicenseTermsAttachedEvent.OutputTuple,
      LicenseTermsAttachedEvent.OutputObject
    >;

    "LicenseTokensMinted(address,address,address,uint256,uint256,address,uint256)": TypedContractEvent<
      LicenseTokensMintedEvent.InputTuple,
      LicenseTokensMintedEvent.OutputTuple,
      LicenseTokensMintedEvent.OutputObject
    >;
    LicenseTokensMinted: TypedContractEvent<
      LicenseTokensMintedEvent.InputTuple,
      LicenseTokensMintedEvent.OutputTuple,
      LicenseTokensMintedEvent.OutputObject
    >;
  };
}
