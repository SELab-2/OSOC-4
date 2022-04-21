import { Url } from "../utils/ApiClient";

export class StudentCache {
    cache = {};

    async getStudent(url, userid) {
        let student = cache[url];
        if (student) {
            return student
        }

        student = Url.fromUrl(url).get().then(res => {
            if (res.success) {
                res = res.data;
                Object.values(res["suggestions"]).forEach((item, index) => {
                    if (item["suggested_by_id"] === userid) {
                        res["own_suggestion"] = item;
                    }
                });
                console.log(res);
                cache[url] = res;
                return res;
            }
        })
        if (student) {
            return student
        }
        return undefined;
    }

}

export const cache = new StudentCache();