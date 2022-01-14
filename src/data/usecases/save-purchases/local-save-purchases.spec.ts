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
        expect(cacheStore.actions).toEqual([])
    })

    //Nao insere cache se o delete falhar
    test('Should not insert new Cache if delete fails', async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchase())
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete])

        await expect(promise).rejects.toThrow()
    })

    //Garante que o insert e delete sejam chamados com  a key certa
    test('Should insert new Cache if delete succeeds', async () => {
        const timestamp = new Date()
        const { cacheStore, sut } = makeSut()
        const purchases = mockPurchase()
        const promise = sut.save(purchases)
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert])
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(cacheStore.insertKey).toBe('purchases')
        expect(cacheStore.insertValues).toEqual({
            timestamp,
            value: purchases
        })
        await expect(promise).resolves.toBeFalsy()
    })

    //Garante que o metodo vai inserir um excecao
    test('Should throw if insert throws', async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateInsertError()
        const promise = sut.save(mockPurchase())
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert])
        await expect(promise).rejects.toThrow()
    })

})
