import type { AcceptedPlugin } from 'postcss'

import cssMacro from 'weapp-tailwindcss/css-macro/postcss'

export const weappTailwindcssPostcssPlugins: AcceptedPlugin[] = [cssMacro]

const plugins: AcceptedPlugin[] = [cssMacro]

export default plugins
