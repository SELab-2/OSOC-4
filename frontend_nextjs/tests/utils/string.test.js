import {titlecase} from "../../utils/string";

describe('String util', () => {
    it('Transform string to Titlecase', function () {
        let expection = "Abcdefgh"
        expect(titlecase("ABCDEFGH")).toBe(expection)
        expect(titlecase("abcdefgh")).toBe(expection)
        expect(titlecase("Abcdefgh")).toBe(expection)
        expect(titlecase("aBCDEFGH")).toBe(expection)
        expect(titlecase("AbCdEfGh")).toBe(expection)
    });
})