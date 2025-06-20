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

export interface ILicenseTemplateInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "allowDerivativeRegistration"
      | "canAttachToGroupIp"
      | "canOverrideRoyaltyPercent"
      | "exists"
      | "getEarlierExpireTime"
      | "getExpireTime"
      | "getLicenseTermsURI"
      | "getMetadataURI"
      | "getRoyaltyPolicy"
      | "isLicenseTransferable"
      | "name"
      | "supportsInterface"
      | "toJson"
      | "totalRegisteredLicenseTerms"
      | "verifyCompatibleLicenses"
      | "verifyMintLicenseToken"
      | "verifyRegisterDerivative"
      | "verifyRegisterDerivativeForAllParents"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "LicenseTermsRegistered"): EventFragment;

  encodeFunctionData(
    functionFragment: "allowDerivativeRegistration",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "canAttachToGroupIp",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "canOverrideRoyaltyPercent",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "exists",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getEarlierExpireTime",
    values: [BigNumberish[], BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getExpireTime",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getLicenseTermsURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getMetadataURI",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRoyaltyPolicy",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isLicenseTransferable",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "toJson",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalRegisteredLicenseTerms",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "verifyCompatibleLicenses",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyMintLicenseToken",
    values: [BigNumberish, AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyRegisterDerivative",
    values: [AddressLike, AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyRegisterDerivativeForAllParents",
    values: [AddressLike, AddressLike[], BigNumberish[], AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "allowDerivativeRegistration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "canAttachToGroupIp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "canOverrideRoyaltyPercent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "exists", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getEarlierExpireTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExpireTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLicenseTermsURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMetadataURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoyaltyPolicy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isLicenseTransferable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "toJson", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalRegisteredLicenseTerms",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyCompatibleLicenses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyMintLicenseToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyRegisterDerivative",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyRegisterDerivativeForAllParents",
    data: BytesLike
  ): Result;
}

export namespace LicenseTermsRegisteredEvent {
  export type InputTuple = [
    licenseTermsId: BigNumberish,
    licenseTemplate: AddressLike,
    licenseTerms: BytesLike
  ];
  export type OutputTuple = [
    licenseTermsId: bigint,
    licenseTemplate: string,
    licenseTerms: string
  ];
  export interface OutputObject {
    licenseTermsId: bigint;
    licenseTemplate: string;
    licenseTerms: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ILicenseTemplate extends BaseContract {
  connect(runner?: ContractRunner | null): ILicenseTemplate;
  waitForDeployment(): Promise<this>;

  interface: ILicenseTemplateInterface;

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

  allowDerivativeRegistration: TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [boolean],
    "view"
  >;

  canAttachToGroupIp: TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [boolean],
    "view"
  >;

  canOverrideRoyaltyPercent: TypedContractMethod<
    [licenseTermsId: BigNumberish, newRoyaltyPercent: BigNumberish],
    [boolean],
    "view"
  >;

  exists: TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [boolean],
    "view"
  >;

  getEarlierExpireTime: TypedContractMethod<
    [licenseTermsIds: BigNumberish[], start: BigNumberish],
    [bigint],
    "view"
  >;

  getExpireTime: TypedContractMethod<
    [licenseTermsId: BigNumberish, start: BigNumberish],
    [bigint],
    "view"
  >;

  getLicenseTermsURI: TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [string],
    "view"
  >;

  getMetadataURI: TypedContractMethod<[], [string], "view">;

  getRoyaltyPolicy: TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [
      [string, bigint, bigint, string] & {
        royaltyPolicy: string;
        royaltyPercent: bigint;
        mintingLicenseFee: bigint;
        currencyToken: string;
      }
    ],
    "view"
  >;

  isLicenseTransferable: TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [boolean],
    "view"
  >;

  name: TypedContractMethod<[], [string], "view">;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  toJson: TypedContractMethod<[licenseTermsId: BigNumberish], [string], "view">;

  totalRegisteredLicenseTerms: TypedContractMethod<[], [bigint], "view">;

  verifyCompatibleLicenses: TypedContractMethod<
    [licenseTermsIds: BigNumberish[]],
    [boolean],
    "view"
  >;

  verifyMintLicenseToken: TypedContractMethod<
    [
      licenseTermsId: BigNumberish,
      licensee: AddressLike,
      licensorIpId: AddressLike,
      amount: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;

  verifyRegisterDerivative: TypedContractMethod<
    [
      childIpId: AddressLike,
      parentIpId: AddressLike,
      licenseTermsId: BigNumberish,
      licensee: AddressLike
    ],
    [boolean],
    "nonpayable"
  >;

  verifyRegisterDerivativeForAllParents: TypedContractMethod<
    [
      childIpId: AddressLike,
      parentIpId: AddressLike[],
      licenseTermsIds: BigNumberish[],
      caller: AddressLike
    ],
    [boolean],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "allowDerivativeRegistration"
  ): TypedContractMethod<[licenseTermsId: BigNumberish], [boolean], "view">;
  getFunction(
    nameOrSignature: "canAttachToGroupIp"
  ): TypedContractMethod<[licenseTermsId: BigNumberish], [boolean], "view">;
  getFunction(
    nameOrSignature: "canOverrideRoyaltyPercent"
  ): TypedContractMethod<
    [licenseTermsId: BigNumberish, newRoyaltyPercent: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "exists"
  ): TypedContractMethod<[licenseTermsId: BigNumberish], [boolean], "view">;
  getFunction(
    nameOrSignature: "getEarlierExpireTime"
  ): TypedContractMethod<
    [licenseTermsIds: BigNumberish[], start: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "getExpireTime"
  ): TypedContractMethod<
    [licenseTermsId: BigNumberish, start: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "getLicenseTermsURI"
  ): TypedContractMethod<[licenseTermsId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "getMetadataURI"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getRoyaltyPolicy"
  ): TypedContractMethod<
    [licenseTermsId: BigNumberish],
    [
      [string, bigint, bigint, string] & {
        royaltyPolicy: string;
        royaltyPercent: bigint;
        mintingLicenseFee: bigint;
        currencyToken: string;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "isLicenseTransferable"
  ): TypedContractMethod<[licenseTermsId: BigNumberish], [boolean], "view">;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "toJson"
  ): TypedContractMethod<[licenseTermsId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "totalRegisteredLicenseTerms"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "verifyCompatibleLicenses"
  ): TypedContractMethod<[licenseTermsIds: BigNumberish[]], [boolean], "view">;
  getFunction(
    nameOrSignature: "verifyMintLicenseToken"
  ): TypedContractMethod<
    [
      licenseTermsId: BigNumberish,
      licensee: AddressLike,
      licensorIpId: AddressLike,
      amount: BigNumberish
    ],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "verifyRegisterDerivative"
  ): TypedContractMethod<
    [
      childIpId: AddressLike,
      parentIpId: AddressLike,
      licenseTermsId: BigNumberish,
      licensee: AddressLike
    ],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "verifyRegisterDerivativeForAllParents"
  ): TypedContractMethod<
    [
      childIpId: AddressLike,
      parentIpId: AddressLike[],
      licenseTermsIds: BigNumberish[],
      caller: AddressLike
    ],
    [boolean],
    "nonpayable"
  >;

  getEvent(
    key: "LicenseTermsRegistered"
  ): TypedContractEvent<
    LicenseTermsRegisteredEvent.InputTuple,
    LicenseTermsRegisteredEvent.OutputTuple,
    LicenseTermsRegisteredEvent.OutputObject
  >;

  filters: {
    "LicenseTermsRegistered(uint256,address,bytes)": TypedContractEvent<
      LicenseTermsRegisteredEvent.InputTuple,
      LicenseTermsRegisteredEvent.OutputTuple,
      LicenseTermsRegisteredEvent.OutputObject
    >;
    LicenseTermsRegistered: TypedContractEvent<
      LicenseTermsRegisteredEvent.InputTuple,
      LicenseTermsRegisteredEvent.OutputTuple,
      LicenseTermsRegisteredEvent.OutputObject
    >;
  };
}
