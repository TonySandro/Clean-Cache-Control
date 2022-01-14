import { LocalSavePurchases } from './local-save-purchases'
import { mockPurchase } from '../../tests/mock-puchases'
import { CacheStoreSpy } from '../../tests/mock-cache'


type SutTypes = {
    sut: LocalSavePurchases
    cacheStore: CacheStoreSpy
}

// factory method
const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalSavePurchases(cacheStore, timestamp)
    return {
        sut,
        cacheStore
    }
}
//Garante que nao tenha error por modificacoes no construtor
describe('LocalSavePurchases', () => {
    test('Should not delete or insert cache on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.messages).toEqual([])
    })

    //Nao insere cache se o delete falhar
    test('Should not insert new Cache if delete fails', async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchase())
        expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete])

        await expect(promise).rejects.toThrow()
    })

    //Garante que o insert e delete sejam chamados com  a key certa
    test('Should insert new Cache if delete succeeds', async () => {
        const timestamp = new Date()
        const { cacheStore, sut } = makeSut()
        const purchases = mockPurchase()
        await sut.save(purchases)
        expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(cacheStore.insertKey).toBe('purchases')
        expect(cacheStore.insertValues).toEqual({
            timestamp,
            value: purchases
        })
    })

    //Garante que o metodo vai inserir um excecao
    test('Should throw if insert throws', async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateInsertError()
        const promise = sut.save(mockPurchase())
        expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete, CacheStoreSpy.Message.insert])
        await expect(promise).rejects.toThrow()
    })

})
