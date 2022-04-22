import {Url} from "../utils/ApiClient";

describe('ApiClient', () => {
    let url
    beforeEach(() => {
        url = new Url()
    })

    it('Create an Url object from a name', () => {
        expect(Url.fromName('test')).toEqual(new Url('test', null))
    })

    it('Create an Url object from an url', () => {
        expect(Url.fromUrl('test')).toEqual(new Url(null, 'test'))
    })

    it('Extend a given url', () => {
        let ext = "extended"
        url.extend(ext)
        expect(url._extension).toBe(ext)
    })

    it('Attach params to Url', () => {
        let params = {"test_param": "test", "int_test": 16, "null_test": null}
        url.setParams(params)

        expect(url._params).toEqual(params)
    })

    it('Attach body to Url', () => {
        let body = ["test_body", "test", "int_test", 16, "null_test", null]
        url.setBody(body)

        expect(url._body).toEqual(body)
    })
})