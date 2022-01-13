import { CacheStore } from '@/data/protocols/cache'
import { LocalSavePurchases } from './local-save-purchases'

class CacheStoreSpy implements CacheStore {
    deleteCallsCount = 0
    insertCallsCount = 0
    deleteKey: string
    insertKey: string

    delete(key: string): void {
        this.deleteCallsCount++
        this.deleteKey = key
    }
    insert(key: string): void {
        this.insertCallsCount++
        this.deleteKey = key

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
        //Precisa da chave correta para deletar o cache
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    //Nao insere cache se o delete falhar
    test('Should not insert new Cache if delete fails', () => {
        const { cacheStore, sut } = makeSut()
        jest.spyOn(cacheStore, 'delete').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.save()
        expect(cacheStore.insertCallsCount).toBe(0)
        expect(promise).rejects.toThrow()
    })

    //Garante que o insert e delete sejam chamados com  a key certa
    test('Should insert new Cache if delete succeeds', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.save()
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.insertCallsCount).toBe(1)
        expect(cacheStore.insertKey).toBe('purchases')
    })
})
