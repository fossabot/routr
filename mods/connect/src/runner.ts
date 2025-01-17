#!/usr/bin/env node
/*
 * Copyright (C) 2022 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License");
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
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("./tracer").init("dispatcher")
import connectProcessor from "./service"
import { Assertions as A } from "@routr/common"

A.assertEnvsAreSet(["LOCATION_ADDR", "API_ADDR"])

connectProcessor({
  bindAddr: process.env.BIND_ADDR ?? "0.0.0.0:51904",
  locationAddr: process.env.LOCATION_ADDR,
  apiAddr: process.env.API_ADDR
})
