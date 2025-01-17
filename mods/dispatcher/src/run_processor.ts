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
import { ProcessorUnavailableError } from "./errors"
import { findProcessor } from "./find_processor"
import { RunProcessorParams } from "./types"
import ot from "@opentelemetry/api"
import * as grpc from "@grpc/grpc-js"
import { getLogger } from "@fonoster/logger"

const logger = getLogger({ service: "dispatcher", filePath: __filename })

/**
 * Runs the processor.
 *
 * @param {RunProcessorParams} params - The parameters for the run processor
 * @return {Promise<any>}
 */
export function runProcessor(params: RunProcessorParams) {
  const currentSpan = ot.trace.getSpan(ot.context.active())
  // display traceid in the terminal
  logger.silly(`traceid: ${currentSpan?.spanContext().traceId}`)
  const tracer = ot.trace.getTracer("routr-tracer")
  const span = tracer.startSpan("server.js:sayHello()", { kind: 1 })
  span.addEvent("invoking sayHello() to...")

  const { callback, connections, processors, request } = params
  const matchResult = findProcessor(processors)(request)

  if ("code" in matchResult) {
    return callback(matchResult)
  }

  logger.silly("forwarding request to processor", {
    processorRef: matchResult.ref
  })

  const conn = connections.get(matchResult.ref)
  // Connects to downstream processor
  conn.processMessage(request, (err: { code: number }, response: unknown) => {
    if (err?.code === grpc.status.UNAVAILABLE) {
      // We augment the error to indicate which processor failed
      callback(new ProcessorUnavailableError(matchResult.ref))
      return
    }
    callback(err, response)
  })
}
