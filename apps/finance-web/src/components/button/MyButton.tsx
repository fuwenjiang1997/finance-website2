import cn from 'classnames'
import type { FunctionalComponent } from 'vue'

export enum MyTagButtonSize {
  Small = 'small',
  Default = 'default',
}

interface MyTagButtonProps {
  active?: boolean
  size?: MyTagButtonSize
  onClick?: () => void
}

export const MyTagButton: FunctionalComponent<MyTagButtonProps> = (
  props,
  { slots, emit, attrs },
) => {
  const size = props.size || MyTagButtonSize.Default

  const sizeClass = {
    [MyTagButtonSize.Default]: 'h-8 min-w-8',
    [MyTagButtonSize.Small]: 'h-6 min-w-6',
  }

  return (
    <div
      class={cn(
        'flex-center px-1 rounded text-sm cursor-pointer hover:bg-[#f8f8f8]',
        sizeClass[size],
        {
          ' !bg-[#f2f2f2] ': props.active,
        },
      )}
    >
      {slots.default?.()}
    </div>
  )
}
