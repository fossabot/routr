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
import { MiddlewareUnavailableError } from "./errors"
import { ProcessorGPRCConnection, RunMiddlewaresParams } from "./types"
import {
  MessageRequest,
  MessageResponse,
  CommonTypes as CT
} from "@routr/common"
import * as grpc from "@grpc/grpc-js"
import { getLogger } from "@fonoster/logger"

const logger = getLogger({ service: "dispatcher", filePath: __filename })

// eslint-disable-next-line require-jsdoc
async function processMessage(
  middlewareRef: string,
  conn: ProcessorGPRCConnection,
  request: MessageRequest
): Promise<MessageResponse> {
  return new Promise((resolve, reject) => {
    conn.processMessage(request, (err: { code: number }, response: unknown) => {
      return err?.code === grpc.status.UNAVAILABLE
        ? reject(new MiddlewareUnavailableError(middlewareRef))
        : resolve(response as MessageResponse)
    })
  })
}

// eslint-disable-next-line require-jsdoc
export async function runMiddlewares(
  params: RunMiddlewaresParams
): Promise<MessageRequest> {
  const { connections, request, middlewares = [] } = params
  const req = { ...request }
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, rejects) => {
    // eslint-disable-next-line no-loops/no-loops
    for (const midd of middlewares) {
      logger.silly("sending request to middleware", {
        ref: request.ref,
        middlewareRef: midd.ref,
        addr: midd.addr
      })
      // Get the next middleware
      const conn = connections.get(midd.ref)
      // Send message and re-insert response for next middleware
      try {
        req.message = (await processMessage(midd.ref, conn, req))
          .message as unknown as CT.SIPMessage
        if (req.message.messageType === CT.MessageType.RESPONSE) {
          logger.silly(
            "found messageType to be responseType and broke the chain",
            {
              ref: request.ref,
              middlewareRef: midd.ref,
              addr: midd.addr
            }
          )
          break
        }
      } catch (e) {
        rejects(e)
      }
    }
    resolve(req)
  })
}
