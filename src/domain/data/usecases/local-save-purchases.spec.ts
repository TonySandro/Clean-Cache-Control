class LocalSavePurchases {
    constructor(private readonly cacheStore: CacheStore) { }

    async save(): Promise<void> {
        this.cacheStore.delete('purchases')
    }
}

interface CacheStore {
    delete: (key: string) => void
}

class CacheStoreSpy implements CacheStore {
    deleteCallsCount = 0
    key: string

    delete(key: string): void {
        this.deleteCallsCount++
        this.key = key
    }
}

type SutTypes = {
    sut: LocalSavePurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalSavePurchases(cacheStore)
    return {
        sut,
        cacheStore
    }
}
//Garante que nao tenha error por modificacoes no construtor
describe('LocalSavePurchases', () => {
    test('Should not delete cache on sut.init', () => {
        const { cacheStore } = makeSut()
        new LocalSavePurchases(cacheStore)
        expect(cacheStore.deleteCallsCount).toBe(0)
    })

    //Garantir que antes de salvar o cache, ele limpe o cache atual
    test('Should delete old cache on sut.save', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.save()
        expect(cacheStore.deleteCallsCount).toBe(1)
    })

    //Precisa da chave correta para deletar o cache
    test('Should call delete with correct key', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.save()
        expect(cacheStore.key).toBe('purchases')
    })
})
