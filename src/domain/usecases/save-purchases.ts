export interface SavePurchases {
    save: (purchases: Array<SavePurchases.params>) => Promise<void>

}

export namespace SavePurchases {
    export type params = {
        id: string
        date: Date
        value: number
    }

}
