import cn from 'classnames'
import { computed, type FunctionalComponent } from 'vue'

export enum MyTagButtonSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}

interface MyTagButtonProps {
  active?: boolean
  bgColor?: string
  activeBgColor?: string
  activeColor?: string
  color?: string
  size?: MyTagButtonSize
  class?: string
  onClick?: () => void
}

export const MyTagButton: FunctionalComponent<MyTagButtonProps> = (
  props,
  { slots, emit, attrs },
) => {
  const size = props.size || MyTagButtonSize.Default

  const sizeClass = {
    [MyTagButtonSize.Default]: 'h-8 min-w-8 px-2',
    [MyTagButtonSize.Small]: 'h-6 min-w-6 px-1',
    [MyTagButtonSize.Large]: 'h-10 min-w-10 px-1',
  }

  const style = computed(() => {
    let style = ``
    if (props.color) {
      style += `color: ${props.color}`
    }
    if (props.bgColor) {
      style += `background: ${props.bgColor}`
    }
    return style
  })

  return (
    <div
      class={cn(
        'flex-center rounded text-sm cursor-pointer hover:bg-[#f8f8f8]',
        sizeClass[size],
        {
          ' !bg-[#f2f2f2] ': props.active,
        },
        props.class,
      )}
      style={style.value}
    >
      {slots.default?.()}
    </div>
  )
}
