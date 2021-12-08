// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Keypair } from '../types';
import type { HashType } from './types';

import { assert, bnToU8a, u8aConcat } from '@polkadot/util';
import { secp256k1Sign as wasm } from '@polkadot/wasm-crypto';
import { Signature, signSync } from '@polkadot/x-noble-secp256k1';

import { BN_BE_256_OPTS } from '../bn';
import { isWasm } from '../helpers';
import { hasher } from './hasher';

/**
 * @name secp256k1Sign
 * @description Returns message signature of `message`, using the supplied pair
 */
export function secp256k1Sign (message: Uint8Array | string, { secretKey }: Partial<Keypair>, hashType: HashType = 'blake2', onlyJs?: boolean): Uint8Array {
  assert(secretKey?.length === 32, 'Expected valid secp256k1 secretKey, 32-bytes');

  const data = hasher(hashType, message, onlyJs);

  if (isWasm(onlyJs)) {
    return wasm(data, secretKey);
  }

  const [sigBytes, recoveryParam] = signSync(data, secretKey, { canonical: true, recovered: true });
  const { r, s } = Signature.fromHex(sigBytes);

  return u8aConcat(
    bnToU8a(r, BN_BE_256_OPTS),
    bnToU8a(s, BN_BE_256_OPTS),
    new Uint8Array([recoveryParam || 0])
  );
}
