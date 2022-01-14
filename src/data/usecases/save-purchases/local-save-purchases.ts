import { CacheStore } from '@/data/protocols/cache'
import { SavePurchases } from '@/domain/usecases'

export class LocalSavePurchases {
    constructor(
        private readonly cacheStore: CacheStore,
        private readonly timestamp: Date
    ) { }

    async save(purchases: Array<SavePurchases.params>): Promise<void> {
        this.cacheStore.delete('purchases')
        this.cacheStore.insert('purchases', {
            timestamp: this.timestamp,
            value: purchases
        })
    }
}