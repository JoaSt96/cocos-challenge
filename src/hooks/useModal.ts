import {type ComponentType} from "react"

import {useModalContext} from "@/components/modals/ModalContext"

/**
 * Custom hook for creating and managing bottom sheet modals
 * @param Component - The React component to render inside the bottom sheet
 * @param propsOrFactory - Either:
 *   1. A function that receives dismiss function and returns props for the Component
 *   2. Direct props object to pass to the Component
 * @returns Function to show the modal
 *
 * @example
 * // With dismiss function
 * const showLoginModal = useModal(LoginModal, dismiss => ({
 *   onSuccess: async () => {
 *     await dismiss()
 *     // Do something after modal is closed
 *   }
 * }))
 *
 * // With direct props (no dismiss needed)
 * const showInfoModal = useModal(InfoModal, {
 *   title: "Information",
 *   message: "This is some important information"
 * })
 */
export const useModal = <T extends object>(
  Component: ComponentType<T>,
  propsOrFactory?: ((dismiss: () => Promise<void>) => T) | Partial<T>
) => {
  const {showModal} = useModalContext()

  return () => showModal(Component, propsOrFactory)
}
