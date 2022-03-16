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
declare const System: any

import EdgePort from './edgeport'
import { getConfig } from "./config/get_config"
import { EdgePortConfig } from './types'

const config = getConfig<EdgePortConfig>(System.getenv('CONFIG_PATH'))

if (config._tag === 'Right') {
  EdgePort(config.right)
} else {
  console.error(config.left)
}