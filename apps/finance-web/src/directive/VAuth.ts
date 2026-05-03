import { type Directive, type DirectiveBinding } from 'vue'
import { useUserStore, type UserRole } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import { createDiscreteApi } from 'naive-ui'

export enum Mode {
  hide = 'hide',
  disable = 'disable',
  tips = 'tips',
}

export enum TriggerType {
  click = 'click',
  default = 'default',
}

type RuleParams = UserRole | 'all'

type AuthParams = RuleParams | RuleParams[] | ConfigParams

interface ConfigParams {
  roles?: RuleParams[]
  mode?: Mode
  triggerType?: TriggerType
  disabledClass?: string
  tipText?: string
}

interface ConfigRes {
  roles: RuleParams[]
  mode: Mode
  triggerType: TriggerType
  disabledClass?: string
  tipText?: string
}

type GuardEl = HTMLElement & {
  __authGuardHandler?: (e: MouseEvent) => void
  __authGuardConf?: ReturnType<typeof normalize>
}

function normalize(binding: DirectiveBinding<AuthParams>): ConfigRes {
  const v = binding.value
  const config: ConfigRes = {
    roles: ['all'],
    mode: Mode.disable,
    triggerType: TriggerType.default,
  }

  if (!v || typeof v === 'string') {
    config.roles = [v || 'all']
  } else if (Array.isArray(v)) {
    config.roles = v
  } else if (typeof v === 'object') {
    Object.assign(config, v)
  }

  return config
}

const { message: $message } = createDiscreteApi(['message'])

function apply(el: GuardEl, isAllow: boolean) {
  const config = el.__authGuardConf

  if (config?.mode === Mode.hide) {
    el.style.display = 'none'
  } else if (config?.mode === Mode.disable) {
    if (config.disabledClass) {
      el.classList.add(config.disabledClass)
    } else {
      el.setAttribute('disabled', 'true')
    }
  }

  const handler = (e: MouseEvent) => {
    if (!isAllow) {
      e.stopPropagation()
      e.preventDefault()
      e.stopImmediatePropagation()

      if (config?.tipText) {
        $message.error(config.tipText)
      }
    }
  }

  el.__authGuardHandler = handler
  el.addEventListener('click', handler, { capture: true })
}

export const vAuth: Directive<HTMLElement, AuthParams> = {
  mounted(_el, binding) {
    const el = _el as GuardEl
    const userStore = useUserStore()
    const { userRole } = storeToRefs(userStore)
    el.__authGuardConf = normalize(binding)

    function checkIsAllow() {
      try {
        return !!el.__authGuardConf?.roles.includes(userRole.value || 'all')
      } catch (error) {
        console.log('check auth error: ', error)
        return false
      }
    }

    apply(el, checkIsAllow())
  },
  updated(el, binding) {
    // const userStore = useUserStore()
    // const { userRole } = storeToRefs(userStore)
    // const config = normalize(binding)
    // function checkIsAllow() {
    //   return config.roles.includes(userRole.value || 'all')
    // }
    // apply(el, checkIsAllow(), config)
  },
  unmounted(_el) {
    const el = _el as GuardEl
    if (el.__authGuardHandler) {
      el.removeEventListener('click', el.__authGuardHandler, { capture: true })
      delete el.__authGuardHandler
    }
    delete el.__authGuardConf
  },
}
