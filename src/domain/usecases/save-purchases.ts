export interface SavePurchases {
    save: (purchases: Array<SavePurchases.params>)=> Promise<void>

}

namespace SavePurchases {
    export type params ={
        id: string
        date: Date
        value: number
    }

}
