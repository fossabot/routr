/*
 * Copyright (C) 2022 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License")
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { NetInterface, Transport } from "./types"

/**
 * Makes a deep copy of an object.
 *
 * @param {object} source - The source object.
 * @return {object} The deep copy of the source object.
 */
export const deepCopy = <T>(source: T): T => {
  return Array.isArray(source)
    ? source.map((item) => deepCopy(item))
    : source instanceof Date
    ? new Date(source.getTime())
    : source && typeof source === "object"
    ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
        Object.defineProperty(
          o,
          prop,
          Object.getOwnPropertyDescriptor(source, prop)
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        o[prop] = deepCopy((source as { [key: string]: any })[prop])
        return o
      }, Object.create(Object.getPrototypeOf(source)))
    : (source as T)
}

/**
 * Gets a listening point from a request.
 *
 * @param {NetInterface[]} listeningPoints - The listening points.
 * @param {Transport} transport - The transport.
 * @return {NetInterface} transport The deep copy of the source object.
 */
export const getListeningPoint = (
  listeningPoints: NetInterface[],
  transport: Transport
) => {
  const listeningPoint = transport
    ? listeningPoints.find(
        (lp) => lp.transport.toLowerCase() === transport.toLowerCase()
      )
    : listeningPoints.find((lp) => lp.transport.toLowerCase() === Transport.UDP)

  if (!listeningPoint) {
    throw new Error(`no listening point found for transport ${transport}`)
  }

  return listeningPoint
}
