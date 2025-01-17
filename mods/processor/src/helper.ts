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
import {
  MessageRequest,
  Route,
  Transport,
  CommonTypes as CT,
  Helper,
  NetInterface
} from "@routr/common"
import { IpUtils } from "@routr/common"
import { Extensions as E, Target as T } from "./index"

export const isTypeResponse = (request: MessageRequest): boolean =>
  request.message.messageType === CT.MessageType.RESPONSE

export const isTypeRequest = (request: MessageRequest): boolean =>
  !isTypeResponse(request)

export const getEdgeInterface = (nets: {
  listeningPoints: NetInterface[]
  endpointIntf: NetInterface
  localnets: string[]
  externalAddrs: string[]
}): NetInterface => {
  const { listeningPoints, endpointIntf, localnets, externalAddrs } = nets
  const localnetIp = IpUtils.getLocalnetIp(localnets, endpointIntf.host)
  const host = localnetIp ?? externalAddrs[0]
  const lp = Helper.getListeningPoint(listeningPoints, endpointIntf.transport)

  if (!localnetIp && externalAddrs.length === 0) {
    throw new Error(
      `unable to find a valid interface for host ${endpointIntf.host} and transport ${lp.transport}`
    )
  }

  if (localnetIp && lp.host !== "0.0.0.0" && lp.host !== host) {
    throw new Error(
      `listening point host ${lp.host} does not match interface host ${host}`
    )
  }

  return {
    host,
    port: lp.port,
    transport: lp.transport
  }
}

/**
 * A request traversing a second EdgePort would have updated the requestUri.
 * Therefore, we are able to re-construct the Route from the request.
 *
 * @param {MessageRequest} request - the request
 * @return {Route} the route
 */
export function createRouteFromLastMessage(request: MessageRequest): Route {
  const uri = request.message.requestUri
  const sessionCount = E.getHeaderValue(request, CT.ExtraHeader.SESSION_COUNT)
    ? parseInt(E.getHeaderValue(request, CT.ExtraHeader.SESSION_COUNT))
    : -1

  return {
    edgePortRef: request.edgePortRef,
    user: uri.user,
    host: uri.host,
    port: uri.port,
    transport: uri.transportParam.toLowerCase() as Transport,
    registeredOn: Date.now(),
    sessionCount,
    expires: T.getTargetExpires(request),
    listeningPoints: request.listeningPoints,
    localnets: request.localnets,
    externalAddrs: request.externalAddrs
  }
}
