import React, {type FC} from "react"

import {cva} from "class-variance-authority"
import {Image} from "expo-image"

import {Money} from "@/components/Money"
import {Column} from "@/components/ui/Column"
import {ItemCardPreviousPrice} from "@/components/ui/item-card/ItemCardPreviousPrice"
import {cn} from "@/lib/utils"

type Props = {
  price: number
  previousPrice?: number
  image: string
  contentContainerClassName?: string
}

const minifiedItemCardContainerVariants = cva(
  "bg-background border border-basic-lighter h-[174px] w-[138px] rounded-md p-xs flex-1"
)

const minifiedItemCardImageVariants = cva(
  "h-[120px] w-full self-center rounded-md flex-2"
)

export const HomeExampleMinifiedItemCard: FC<Props> = ({
  price,
  image,
  previousPrice,
  contentContainerClassName,
}) => {
  return (
    <Column
      gap="m"
      className={cn(
        minifiedItemCardContainerVariants(),
        contentContainerClassName
      )}
    >
      <Image
        source={{uri: image}}
        contentFit="cover"
        className={minifiedItemCardImageVariants()}
      />
      <Column gap="none" justify="end" expanded>
        {previousPrice && (
          <ItemCardPreviousPrice
            integerVariant="helper"
            integerWeight="regular"
            adjustFontSizeToFit
            discount={((previousPrice - price) / previousPrice) * 100}
            amount={previousPrice}
          />
        )}

        <Money
          amount={price}
          integerVariant="title"
          integerWeight="medium"
          adjustFontSizeToFit
        />
      </Column>
    </Column>
  )
}
