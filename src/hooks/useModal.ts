import {type ComponentType} from "react"

import {useModalContext} from "@/components/modals/ModalContext"

export const useModal = <T extends object>(
  Component: ComponentType<T>,
  propsOrFactory?: ((dismiss: () => Promise<void>) => T) | Partial<T>
) => {
  const {showModal} = useModalContext()

  return (overrideProps?: Partial<T>) => {
    showModal(Component, dismiss => {
      const baseProps =
        typeof propsOrFactory === "function"
          ? propsOrFactory(dismiss)
          : ({
              ...(propsOrFactory ?? {}),
              dismiss,
            } as T)

      return {
        ...baseProps,
        ...(overrideProps ?? {}),
      }
    })
  }
}
