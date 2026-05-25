import type { AcceptedPlugin } from 'postcss'
import autoprefixer from 'autoprefixer'

import cssMacro from 'weapp-tailwindcss/css-macro/postcss'

export const weappTailwindcssPostcssPlugins: AcceptedPlugin[] = [cssMacro]

const plugins: AcceptedPlugin[] = [autoprefixer(), cssMacro]

export default plugins
