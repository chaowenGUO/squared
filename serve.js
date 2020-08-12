!(function () {
    "use strict";
    var e;
    Object.defineProperty(exports, "__esModule", { value: !0 });
    const t = require("path"),
        i = require("zlib"),
        s = require("fs-extra"),
        r = require("yargs"),
        n = require("express"),
        a = require("body-parser"),
        o = require("cors"),
        l = require("request"),
        c = require("uuid"),
        f = require("archiver"),
        p = require("decompress"),
        d = require("jimp"),
        u = require("tinify"),
        h = require("chalk");
    const m = n();
    let y, g, w, v, b;
    {
        let l,
            c,
            f,
            p = !1,
            x = !1,
            F = !1,
            S = !1,
            _ = 9,
            z = 11,
            R = 100,
            k = !1,
            j = (null === (e = process.env.NODE_ENV) || void 0 === e ? void 0 : e.toLowerCase().startsWith("prod")) ? "production" : "development",
            T = process.env.PORT || "3000";
        try {
            const e = require("./squared.settings.json"),
                { disk_read: t, disk_write: i, unc_read: s, unc_write: r, request_post_limit: n, gzip_level: o, brotli_quality: d, jpeg_quality: h, tinypng_api_key: y, env: g, port: w } = e;
            if (
                (({ cors: c, external: f, routing: l } = e),
                (p = !0 === t || "true" === t),
                (x = !0 === i || "true" === i),
                (F = !0 === s || "true" === s),
                (S = !0 === r || "true" === r),
                !process.env.NODE_ENV && (null == g ? void 0 : g.startsWith("prod")) && (j = "production"),
                !process.env.PORT && w)
            ) {
                const e = parseInt(w[j]);
                !isNaN(e) && e >= 0 && (T = e.toString());
            }
            const v = parseInt(o),
                b = parseInt(d),
                C = parseInt(h);
            isNaN(v) || (_ = v),
                isNaN(b) || (z = b),
                isNaN(C) || (R = C),
                y &&
                    ((u.key = y),
                    u.validate((e) => {
                        e || (k = !0);
                    })),
                m.use(a.json({ limit: n || "250mb" }));
        } catch (e) {
            console.log(`${h.bold.bgGrey.blackBright("FAIL")}: ${e}`);
        }
        const C = r
            .usage("$0 [args]")
            .option("access-all", { type: "boolean", description: "Grant full disk and UNC privileges" })
            .option("access-disk", { alias: "d", type: "boolean", description: "Grant full disk privileges" })
            .option("access-unc", { alias: "u", type: "boolean", description: "Grant full UNC privileges" })
            .option("disk-read", { alias: "r", type: "boolean", description: "Grant disk +r (read only)" })
            .option("disk-write", { alias: "w", type: "boolean", description: "Grant disk +w (write only)" })
            .option("unc-read", { alias: "y", type: "boolean", description: "Grant UNC +r (read only)" })
            .option("unc-write", { alias: "z", type: "boolean", description: "Grant UNC +w (write only)" })
            .option("env", { alias: "e", type: "string", description: "Set environment <prod|dev>", default: j, nargs: 1 })
            .option("port", { alias: "p", type: "number", description: "Port number for HTTP", default: parseInt(T), nargs: 1 })
            .option("cors", { alias: "c", type: "string", description: "Enable CORS access to <origin>", nargs: 1 })
            .epilogue("For more information and source: https://github.com/anpham6/squared").argv;
        if (
            (C.accessAll
                ? ((p = !0), (x = !0), (F = !0), (S = !0))
                : (C.accessDisk ? ((p = !0), (x = !0)) : (C.diskRead && (p = !0), C.diskWrite && (x = !0)), C.accessUnc ? ((F = !0), (S = !0)) : (C.uncRead && (F = !0), C.uncWrite && (S = !0))),
            (j = C.env.startsWith("prod") ? "production" : "development"),
            l)
        ) {
            console.log("");
            let e = 0;
            for (const i of [l.shared, l[j]])
                if (Array.isArray(i))
                    for (const s of i) {
                        const { path: i, mount: r } = s;
                        if (i && r) {
                            const s = t.join(__dirname, r);
                            try {
                                m.use(i, n.static(s)), console.log(`${h.yellow("MOUNT")}: ${h.bgGrey(s)} ${h.yellow("->")} ${h.bold(i)}`), ++e;
                            } catch (e) {
                                console.log(`${h.bold.bgGrey.blackBright("FAIL")}: ${i} -> ${e}`);
                            }
                        }
                    }
            console.log(`\n${h.bold(e)} directories were mounted.\n`);
        } else
            m.use(a.json({ limit: "250mb" })),
                m.use("/", n.static(t.join(__dirname, "html"))),
                m.use("/dist", n.static(t.join(__dirname, "dist"))),
                "development" === j && (m.use("/common", n.static(t.join(__dirname, "html/common"))), m.use("/demos", n.static(t.join(__dirname, "html/demos")))),
                console.log(h.bold.bgGrey.blackBright("FAIL") + ": Routing not defined.");
        console.log(`${h.blue("DISK")}: ${p ? h.green("+") : h.red("-")}r ${x ? h.green("+") : h.red("-")}w`),
            console.log(`${h.blue(" UNC")}: ${F ? h.green("+") : h.red("-")}r ${S ? h.green("+") : h.red("-")}w`),
            C.cors ? (m.use(o({ origin: C.cors })), m.options("*", o())) : (null == c ? void 0 : c.origin) && (m.use(o(c)), m.options("*", o()), (C.cors = "string" == typeof c.origin ? c.origin : "true")),
            isNaN(C.port) && (C.port = parseInt(T)),
            console.log(`${h.blue("CORS")}: ${C.cors ? h.green(C.cors) : h.grey("disabled")}`),
            m.use(a.urlencoded({ extended: !0 })),
            m.listen(C.port, () => console.log(`\n${h["production" === j ? "green" : "yellow"](j.toUpperCase())}: Express server listening on port ${h.bold(C.port)}\n`)),
            (y = new (class {
                constructor(e = !1, t = !1, i = !1, s = !1) {
                    (this.disk_read = e),
                        (this.disk_write = t),
                        (this.unc_read = i),
                        (this.unc_write = s),
                        ([this.major, this.minor, this.patch] = process.version
                            .substring(1)
                            .split(".")
                            .map((e) => parseInt(e)));
                }
                checkVersion(e, t, i = 0) {
                    return !(this.major < e) && (this.major !== e || (!(this.minor < t) && (this.minor !== t || this.patch >= i)));
                }
                checkPermissions(e, t) {
                    if (this.isDirectoryUNC(t)) {
                        if (!this.unc_write) return e.json({ application: "OPTION: --unc-write", system: "Writing to UNC shares is not enabled." }), !1;
                    } else if (!this.disk_write) return e.json({ application: "OPTION: --disk-write", system: "Writing to disk is not enabled." }), !1;
                    try {
                        if (s.existsSync(t)) {
                            if (!s.lstatSync(t).isDirectory()) throw new Error("Root is not a directory.");
                        } else s.mkdirpSync(t);
                    } catch (i) {
                        return e.json({ application: "DIRECTORY: " + t, system: i }), !1;
                    }
                    return !0;
                }
                isFileURI(e) {
                    return /^[A-Za-z]{3,}:\/\/[^/]/.test(e) && !e.startsWith("file:");
                }
                isFileUNC(e) {
                    return /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(e);
                }
                isDirectoryUNC(e) {
                    return /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(e);
                }
                writeFail(e, t) {
                    console.log(`${h.bgRed.bold.white("FAIL")}: ${e} (${t})`);
                }
            })(p, x, F, S)),
            (g = new (class {
                constructor() {
                    this.PATTERN_URL = /^([A-Za-z]+:\/\/[A-Za-z\d.-]+(?::\d+)?)(\/.*)/;
                }
                fromSameOrigin(e, t) {
                    const i = this.PATTERN_URL.exec(e),
                        s = this.PATTERN_URL.exec(t);
                    return !!i && !!s && i[1] === s[1];
                }
                getBaseDirectory(e, t) {
                    const i = e.split(/[\\/]/),
                        s = t.split(/[\\/]/);
                    for (; i.length > 0 && s.length > 0 && i[0] === s[0]; ) i.shift(), s.shift();
                    return [i, s];
                }
                getAbsoluteUrl(e, t) {
                    let i = "";
                    return (
                        "/" === (e = e.replace(/\\/g, "/")).charAt(0)
                            ? (i = "__serverroot__")
                            : e.startsWith("../")
                            ? ((i = "__serverroot__"), (e = this.resolvePath(e, t, !1) || "/" + e.replace(/\.\.\//g, "")))
                            : e.startsWith("./") && (e = e.substring(2)),
                        i + e
                    );
                }
                getFullUri(e, i) {
                    return t.join(e.moveTo || "", e.pathname, i || e.filename).replace(/\\/g, "/");
                }
                resolvePath(e, t, i = !0) {
                    const s = this.PATTERN_URL.exec(t.replace(/\\/g, "/"));
                    if (s) {
                        const t = i ? s[1] : "",
                            r = s[2].split("/");
                        if ((r.pop(), "/" === (e = e.replace(/\\/g, "/")).charAt(0))) return t + e;
                        if (e.startsWith("../")) {
                            const t = [];
                            for (const i of e.split("/")) ".." === i ? (0 === t.length ? r.pop() : t.pop()) : t.push(i);
                            e = t.join("/");
                        }
                        return t + r.join("/") + "/" + e;
                    }
                }
            })()),
            (w = new (class {
                constructor(e, t, i) {
                    (this.gzip_level = e), (this.brotli_quality = t), (this.jpeg_quality = i);
                }
                createGzipWriteStream(e, t, r) {
                    const n = s.createWriteStream(t);
                    return (
                        s
                            .createReadStream(e)
                            .pipe(i.createGzip({ level: null != r ? r : this.gzip_level }))
                            .pipe(n),
                        n
                    );
                }
                createBrotliWriteStream(e, t, r, n = "") {
                    const a = s.createWriteStream(t);
                    return (
                        s
                            .createReadStream(e)
                            .pipe(
                                i.createBrotliCompress({
                                    params: {
                                        [i.constants.BROTLI_PARAM_MODE]: n.includes("text/") ? i.constants.BROTLI_MODE_TEXT : i.constants.BROTLI_MODE_GENERIC,
                                        [i.constants.BROTLI_PARAM_QUALITY]: null != r ? r : this.brotli_quality,
                                        [i.constants.BROTLI_PARAM_SIZE_HINT]: this.getFileSize(e),
                                    },
                                })
                            )
                            .pipe(a),
                        a
                    );
                }
                getFileSize(e) {
                    try {
                        return s.statSync(e).size;
                    } catch (e) {}
                    return 0;
                }
                findFormat(e, t) {
                    return null == e ? void 0 : e.find((e) => e.format === t);
                }
                removeFormat(e, t) {
                    if (e) {
                        const i = e.findIndex((e) => e.format === t);
                        -1 !== i && e.splice(i, 1);
                    }
                }
                getSizeRange(e) {
                    const t = /\(\s*(\d+)\s*,\s*(\d+|\*)\s*\)/.exec(e);
                    return t ? [parseInt(t[1]), "*" === t[2] ? 1 / 0 : parseInt(t[2])] : [0, 1 / 0];
                }
                withinSizeRange(e, t) {
                    if (!t) return !0;
                    const [i, s] = w.getSizeRange(t);
                    if (i > 0 || s < 1 / 0) {
                        const t = w.getFileSize(e);
                        if (0 === t || t < i || t > s) return !1;
                    }
                    return !0;
                }
            })(_, z, R)),
            (v = new (class {
                constructor(e) {
                    this.external = e;
                }
                findExternalPlugin(e, t) {
                    for (const i in e) {
                        const s = e[i];
                        for (const e in s)
                            if (e === t) {
                                let t = s[e];
                                return (t && "object" == typeof t) || (t = {}), [i, t];
                            }
                    }
                    return ["", {}];
                }
                getPrettierParser(e) {
                    switch (e.toLowerCase()) {
                        case "babel":
                        case "babel-flow":
                        case "babel-ts":
                        case "json":
                        case "json-5":
                        case "json-stringify":
                            return [require("prettier/parser-babel")];
                        case "css":
                        case "scss":
                        case "less":
                            return [require("prettier/parser-postcss")];
                        case "flow":
                            return [require("prettier/parser-flow")];
                        case "html":
                        case "angular":
                        case "lwc":
                        case "vue":
                            return [require("prettier/parser-html")];
                        case "graphql":
                            return [require("prettier/parser-graphql")];
                        case "markdown":
                            return [require("prettier/parser-markdown")];
                        case "typescript":
                            return [require("prettier/parser-typescript")];
                        case "yaml":
                            return [require("prettier/parser-yaml")];
                    }
                    return [];
                }
                minifyHtml(e, t) {
                    var i;
                    const s = null === (i = this.external) || void 0 === i ? void 0 : i.html;
                    if (s) {
                        let i = !1;
                        const r = e.split("+"),
                            n = r.length;
                        for (let e = 0; e < n; ++e) {
                            const a = r[e].trim();
                            let [o, l] = this.findExternalPlugin(s, a);
                            if (!o)
                                switch (a) {
                                    case "beautify":
                                        (o = "prettier"), (l = { parser: "html", width: 120, tabWidth: 4 });
                                        break;
                                    case "minify":
                                        (o = "html-minifier-terser"),
                                            (l = {
                                                collapseWhitespace: !0,
                                                collapseBooleanAttributes: !0,
                                                removeEmptyAttributes: !0,
                                                removeRedundantAttributes: !0,
                                                removeScriptTypeAttributes: !0,
                                                removeStyleLinkTypeAttributes: !0,
                                                removeComments: !0,
                                            });
                                }
                            try {
                                switch (o) {
                                    case "prettier": {
                                        l.plugins = this.getPrettierParser(l.parser);
                                        const s = require("prettier").format(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                    case "html-minifier-terser": {
                                        const s = require("html-minifier-terser").minify(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                    case "js_beautify": {
                                        const s = require("js-beautify").html_beautify(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                }
                            } catch (e) {
                                y.writeFail(`External: ${o} [npm run install-chrome]`, e);
                            }
                        }
                        if (i) return t;
                    }
                }
                minifyCss(e, t) {
                    var i;
                    const s = null === (i = this.external) || void 0 === i ? void 0 : i.css;
                    if (s) {
                        let i = !1;
                        const r = e.split("+"),
                            n = r.length;
                        for (let e = 0; e < n; ++e) {
                            const a = r[e].trim();
                            let [o, l] = this.findExternalPlugin(s, a);
                            if (!o)
                                switch (a) {
                                    case "beautify":
                                        (o = "prettier"), (l = { parser: "css", tabWidth: 4 });
                                        break;
                                    case "minify":
                                        (o = "clean_css"), (l = { level: 1, inline: ["none"] });
                                }
                            try {
                                switch (o) {
                                    case "prettier": {
                                        l.plugins = this.getPrettierParser(l.parser);
                                        const s = require("prettier").format(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                    case "clean_css": {
                                        const s = new (require("clean-css"))(l).minify(t).styles;
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                    case "js_beautify": {
                                        const s = require("js-beautify").css_beautify(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                }
                            } catch (e) {
                                y.writeFail(`External: ${o} [npm run install-chrome]`, e);
                            }
                        }
                        if (i) return t;
                    }
                }
                minifyJs(e, t) {
                    var i;
                    const s = null === (i = this.external) || void 0 === i ? void 0 : i.js;
                    if (s) {
                        let i = !1;
                        const r = e.split("+"),
                            n = r.length;
                        for (let e = 0; e < n; ++e) {
                            const a = r[e].trim();
                            let [o, l] = this.findExternalPlugin(s, a);
                            if (!o)
                                switch (a) {
                                    case "beautify":
                                        (o = "prettier"), (l = { parser: "babel", width: 100, tabWidth: 4 });
                                        break;
                                    case "minify":
                                        (o = "terser"), (l = { toplevel: !0, keep_classnames: !0 });
                                }
                            try {
                                switch (o) {
                                    case "prettier": {
                                        l.plugins = this.getPrettierParser(l.parser);
                                        const s = require("prettier").format(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                    case "terser": {
                                        const s = require("terser").minify(t, l).code;
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                    case "js_beautify": {
                                        const s = require("js-beautify").js_beautify(t, l);
                                        if (s) {
                                            if (e === n - 1) return s;
                                            (t = s), (i = !0);
                                        }
                                        break;
                                    }
                                }
                            } catch (e) {
                                y.writeFail(`External: ${o} [npm run install-chrome]`, e);
                            }
                        }
                        if (i) return t;
                    }
                }
                formatContent(e, t, i) {
                    return t.endsWith("text/html") || t.endsWith("application/xhtml+xml") ? this.minifyHtml(i, e) : t.endsWith("text/css") ? this.minifyCss(i, e) : t.endsWith("text/javascript") ? this.minifyJs(i, e) : void 0;
                }
                removeCss(e, t) {
                    let i,
                        s,
                        r,
                        n = !1;
                    for (let a of t) {
                        for (a = a.replace(/\./g, "\\."), s = new RegExp(`^\\s*${a}[\\s\\n]*\\{[\\s\\S]*?\\}\\n*`, "gm"); (r = s.exec(e)); ) (i = (i || e).replace(r[0], "")), (n = !0);
                        for (n && ((e = i), (n = !1)), s = new RegExp(`^[^,]*(,?[\\s\\n]*${a}[\\s\\n]*[,{](\\s*)).*?\\{?`, "gm"); (r = s.exec(e)); ) {
                            const t = r[1];
                            let s = "";
                            t.trim().endsWith("{") ? (s = " {" + r[2]) : t.startsWith(",") && (s = ", "), (i = (i || e).replace(r[0], r[0].replace(t, s))), (n = !0);
                        }
                        n && ((e = i), (n = !1));
                    }
                    return i;
                }
            })(f)),
            (b = new (class {
                constructor(e) {
                    this.tinify_api_key = e;
                }
                findCompress(e) {
                    return this.tinify_api_key ? w.findFormat(e, "png") : void 0;
                }
                isJpeg(e, i) {
                    var s;
                    if (null === (s = e.mimeType) || void 0 === s ? void 0 : s.endsWith("image/jpeg")) return !0;
                    switch (t.extname(i || e.filename).toLowerCase()) {
                        case ".jpg":
                        case ".jpeg":
                            return !0;
                    }
                    return !1;
                }
                parseResizeMode(e) {
                    const t = /\(\s*(\d+)\s*x\s*(\d+)(?:\s*#\s*(contain|cover|scale))?\s*\)/.exec(e);
                    return t ? { width: parseInt(t[1]), height: parseInt(t[2]), mode: t[3] } : void 0;
                }
                parseOpacity(e) {
                    const t = /|\s*([\d.]+)\s*|/.exec(e);
                    if (t) {
                        const e = parseFloat(t[1]);
                        if (!isNaN(e)) return Math.min(Math.max(e, 0), 1);
                    }
                }
                parseRotation(e) {
                    const t = new Set(),
                        i = /\{\s*([\d\s,]+)\s*\}/.exec(e);
                    if (i)
                        for (const e of i[1].split(",")) {
                            const i = parseInt(e);
                            isNaN(i) || t.add(i);
                        }
                    return t.size > 0 ? Array.from(t) : void 0;
                }
                resize(e, t, i, s) {
                    switch (s) {
                        case "contain":
                            return e.contain(t, i);
                        case "cover":
                            return e.cover(t, i);
                        case "scale":
                            return e.scaleToFit(t, i);
                        default:
                            return e.resize(t, i);
                    }
                }
                rotate(e, i, r, n) {
                    let a = r.length;
                    const o = r[0];
                    if (a > 1) {
                        const e = r.slice(1),
                            o = i + t.extname(i);
                        try {
                            s.copyFileSync(i, o), --a;
                        } catch (e) {
                            a = 0;
                        }
                        for (let t = 0; t < a; ++t)
                            n.delayed++,
                                d
                                    .read(o)
                                    .then((s) => {
                                        const r = e[t];
                                        s.rotate(r);
                                        const a = i.lastIndexOf("."),
                                            o = i.substring(0, a) + "." + r + i.substring(a);
                                        s.write(o, (e) => {
                                            e ? (n.finalize(""), y.writeFail(o, e)) : n.finalize(o);
                                        });
                                    })
                                    .catch((e) => {
                                        n.finalize(""), y.writeFail(o, e);
                                    });
                        try {
                            s.unlinkSync(o);
                        } catch (e) {}
                    }
                    return o ? e.rotate(o) : e;
                }
                opacity(e, t) {
                    return void 0 !== t && t >= 0 && t <= 1 ? e.opacity(t) : e;
                }
            })(k));
    }
    class x {
        constructor(e, t, i) {
            (this.dirname = e),
                (this.assets = t),
                (this.finalize = i),
                (this.delayed = 0),
                (this.files = new Set()),
                (this.filesToRemove = new Set()),
                (this.filesToCompare = new Map()),
                (this.contentToAppend = new Map()),
                (this.requestMain = t.find((e) => e.requestMain)),
                (this.dataMap = t[0].dataMap);
        }
        add(e) {
            this.files.add(e.substring(this.dirname.length + 1));
        }
        delete(e) {
            this.files.delete(e.substring(this.dirname.length + 1));
        }
        replace(e, i) {
            const r = e.filepath;
            if (r)
                if (i.includes("__copy__") && t.extname(r) === t.extname(i))
                    try {
                        s.renameSync(i, r);
                    } catch (e) {
                        y.writeFail(i, e);
                    }
                else this.filesToRemove.add(r), this.delete(r), e.originalName || (e.originalName = e.filename), (e.filename = t.basename(i)), this.add(i);
        }
        validate(e, i) {
            const s = e.pathname.replace(/[\\/]$/, ""),
                r = e.filename,
                n = "/" === t.sep ? "" : "i";
            if (i.pathname)
                for (const e of i.pathname) {
                    const t = e
                        .trim()
                        .replace(/[\\/]/g, "[\\\\/]")
                        .replace(/[\\/]$/, "");
                    if (new RegExp(`^${t}$`, n).test(s) || new RegExp(`^${t}[\\\\/]`, n).test(s)) return !1;
                }
            if (i.filename) for (const e of i.filename) if (e === r || (n && e.toLowerCase() === r.toLowerCase())) return !1;
            if (i.extension) {
                const e = t.extname(r).substring(1).toLowerCase();
                for (const t of i.extension) if (e === t.toLowerCase()) return !1;
            }
            if (i.pattern) {
                const e = t.join(s, r),
                    a = n ? e.replace(/\\/g, "/") : e.replace(/\//g, "\\");
                for (const t of i.pattern) {
                    const i = new RegExp(t);
                    if (i.test(e) || i.test(a)) return !1;
                }
            }
            return !0;
        }
        getFileOutput(e) {
            const i = t.join(this.dirname, e.moveTo || "", e.pathname),
                s = t.join(i, e.filename);
            return (e.filepath = s), { pathname: i, filepath: s };
        }
        getRelativeUrl(e, i) {
            let s = this.assets.find((e) => e.uri === i),
                r = e.uri;
            if (!s && r) {
                const e = g.resolvePath(i, r);
                e && (s = this.assets.find((t) => t.uri === e));
            }
            if (null == s ? void 0 : s.uri) {
                const i = this.requestMain;
                if ((i && (r = g.resolvePath(t.join(("__serverroot__" !== e.moveTo && e.rootDir) || "", e.pathname, e.filename), i.uri)), r)) {
                    const n = g.PATTERN_URL,
                        a = n.exec(s.uri),
                        o = n.exec(r);
                    if (a && o && a[1] === o[1]) {
                        const r = s.rootDir,
                            l = (e.rootDir || "") + e.pathname;
                        if ("__serverroot__" === s.moveTo) {
                            if ("__serverroot__" === e.moveTo) return t.join(s.pathname, s.filename).replace(/\\/g, "/");
                            if (i) {
                                const t = n.exec(i.uri);
                                if (t && t[1] === o[1]) {
                                    const [i] = g.getBaseDirectory(l + "/" + e.filename, t[2]);
                                    return "../".repeat(i.length - 1) + g.getFullUri(s);
                                }
                            }
                        } else {
                            if (!r) {
                                const [e, t] = g.getBaseDirectory(o[2], a[2]);
                                return "../".repeat(e.length - 1) + t.join("/");
                            }
                            if (l === r + s.pathname) return s.filename;
                            if (l === r) return t.join(s.pathname, s.filename).replace(/\\/g, "/");
                        }
                    }
                }
            }
        }
        replacePath(e, t, i, s) {
            var r;
            t = s ? "[^\"'\\s]+" + t : t.replace(/[\\/]/g, "[\\\\/]");
            let n,
                a,
                o = new RegExp(`(?:([sS][rR][cC]|[hH][rR][eE][fF]|[dD][aA][tT][aA]|[pP][oO][sS][tT][eE][rR])=)?(["'])(\\s*)${t}(\\s*)\\2`, "g");
            for (; (a = o.exec(e)); ) void 0 === n && (n = e), (n = n.replace(a[0], (null === (r = a[1]) || void 0 === r ? void 0 : r.toLowerCase()) + `="${i}"` || a[2] + a[3] + i + a[4] + a[2]));
            for (o = new RegExp(`[uU][rR][lL]\\(\\s*(["'])?\\s*${t}\\s*\\1?\\s*\\)`, "g"); (a = o.exec(e)); ) void 0 === n && (n = e), (n = n.replace(a[0], `url(${i})`));
            return n;
        }
        replaceExtension(e, t) {
            const i = e.lastIndexOf(".");
            return e.substring(0, -1 !== i ? i : e.length) + "." + t;
        }
        appendContent(e, t, i) {
            var s;
            const r = e.filepath || this.getFileOutput(e).filepath;
            if (r && void 0 !== e.bundleIndex) {
                const { mimeType: n, format: a } = e;
                if (n) {
                    if (n.endsWith("text/css")) {
                        if (!e.preserve) {
                            const e = null === (s = this.dataMap) || void 0 === s ? void 0 : s.unusedStyles;
                            if (e) {
                                const i = v.removeCss(t, e);
                                i && (t = i);
                            }
                        }
                        if ("@" === n.charAt(0)) {
                            const i = this.transformCss(e, t);
                            i && (t = i);
                        }
                    }
                    if (a) {
                        const e = v.formatContent(t, n, a);
                        e && (t = e);
                    }
                }
                const o = this.getTrailingContent(e);
                if ((o && (t += o), i || 0 === e.bundleIndex)) return t;
                const l = this.contentToAppend.get(r) || [];
                l.splice(e.bundleIndex - 1, 0, t), this.contentToAppend.set(r, l);
            }
        }
        compressFile(e, t, i) {
            var r;
            const n = t.compress,
                a = b.isJpeg(t, i) && w.findFormat(n, "jpeg"),
                o = () => {
                    this.transformBuffer(e, t, i);
                    const r = w.findFormat(n, "gz"),
                        a = w.findFormat(n, "br");
                    if (r && w.withinSizeRange(i, r.condition)) {
                        ++this.delayed;
                        let e = i + ".gz";
                        w.createGzipWriteStream(i, e, r.level)
                            .on("finish", () => {
                                var t;
                                if ((null === (t = r.condition) || void 0 === t ? void 0 : t.includes("%")) && w.getFileSize(e) >= w.getFileSize(i)) {
                                    try {
                                        s.unlinkSync(e);
                                    } catch (e) {}
                                    e = "";
                                }
                                this.finalize(e);
                            })
                            .on("error", (t) => {
                                y.writeFail(e, t), this.finalize("");
                            });
                    }
                    if (a && y.checkVersion(11, 7) && w.withinSizeRange(i, a.condition)) {
                        ++this.delayed;
                        let e = i + ".br";
                        w.createBrotliWriteStream(i, e, a.level, t.mimeType)
                            .on("finish", () => {
                                var t;
                                if ((null === (t = a.condition) || void 0 === t ? void 0 : t.includes("%")) && w.getFileSize(e) >= w.getFileSize(i)) {
                                    try {
                                        s.unlinkSync(e);
                                    } catch (e) {}
                                    e = "";
                                }
                                this.finalize(e);
                            })
                            .on("error", (t) => {
                                y.writeFail(e, t), this.finalize("");
                            });
                    }
                };
            if (a && w.withinSizeRange(i, a.condition)) {
                ++this.delayed;
                const e = i + ((null === (r = a.condition) || void 0 === r ? void 0 : r.includes("%")) ? ".jpg" : "");
                d.read(i)
                    .then((t) => {
                        var r;
                        t.quality(null !== (r = a.level) && void 0 !== r ? r : w.jpeg_quality).write(e, (t) => {
                            if (t) y.writeFail(i, t);
                            else if (e !== i)
                                try {
                                    w.getFileSize(e) >= w.getFileSize(i) ? s.unlinkSync(e) : s.renameSync(e, i);
                                } catch (e) {}
                            this.finalize(""), o();
                        });
                    })
                    .catch((e) => {
                        y.writeFail(i, e), this.finalize(""), o();
                    });
            } else o();
        }
        transformBuffer(e, i, r) {
            var n;
            const a = i.mimeType;
            if (!a || "&" === a.charAt(0)) return;
            const o = i.format;
            switch (a) {
                case "@text/html":
                case "@application/xhtml+xml": {
                    const n = (e, t) => (e ? `<script type="text/javascript" src="${t}"><\/script>` : `<link rel="stylesheet" type="text/css" href="${t}" />`),
                        a = (e) => e.replace(/[\s\n]+/g, ""),
                        l = new Set(),
                        c = i.uri;
                    let f,
                        p = s.readFileSync(r).toString("utf8"),
                        d = p,
                        u = /(\s*)<(script|link|style)[^>]*?([\s\n]+data-chrome-file="\s*(save|export)As:\s*((?:[^"]|\\")+)")[^>]*>(?:[\s\S]*?<\/\2>\n*)?/gi;
                    for (; (f = u.exec(p)); ) {
                        const e = f[0],
                            t = "script" === f[2].toLowerCase(),
                            i = g.getAbsoluteUrl(f[5].split("::")[0].trim(), c);
                        let s = !1;
                        if (("export" === f[4] && (s = new RegExp(`<${t ? "script" : "link"}[^>]+?(?:${t ? "src" : "href"}=(["'])${i}\\1|data-chrome-file="saveAs:${i}[:"])[^>]*>`, "i").test(p)), l.has(i) || s)) d = d.replace(e, "");
                        else if ("save" === f[4]) {
                            const s = e.replace(f[3], ""),
                                r = new RegExp(`\\s+${t ? "src" : "href"}="(?:[^"]|\\\\")+"`, "i").exec(s) || new RegExp(`\\s+${t ? "src" : "href"}='(?:[^']|\\\\')+'`, "i").exec(s);
                            r && ((d = d.replace(e, s.replace(r[0], `${t ? " src" : " href"}="${i}"`))), l.add(i));
                        } else (d = d.replace(e, f[1] + n(t, i))), l.add(i);
                    }
                    l.size > 0 && (p = d), (u = /(\s*)<(script|style)[^>]*>([\s\S]*?)<\/\2>\n*/gi);
                    for (const t of e) {
                        if (t.excluded) continue;
                        const { bundleIndex: e, trailingContent: i } = t;
                        if (void 0 !== e) {
                            const i = t.outerHTML;
                            if (i) {
                                const s = d;
                                let r = "";
                                if ((0 === e || e === 1 / 0 ? ((r = n("text/javascript" === t.mimeType, g.getFullUri(t))), (d = d.replace(i, r))) : (d = d.replace(new RegExp(`\\s*${i}\\n*`), "")), s === d)) {
                                    const e = a(t.content || ""),
                                        s = a(i);
                                    for (; (f = u.exec(p)); )
                                        if (s === a(f[0]) || (e && e === a(f[3]))) {
                                            d = d.replace(f[0], (r ? f[1] : "") + r);
                                            break;
                                        }
                                    u.lastIndex = 0;
                                }
                            }
                        }
                        if (i) {
                            const e = [];
                            for (const t of i) e.push(a(t.value));
                            for (; (f = u.exec(p)); ) {
                                const t = a(f[3]);
                                e.includes(t) && (d = d.replace(f[0], ""));
                            }
                            u.lastIndex = 0;
                        }
                        p = d;
                    }
                    for (const s of e) {
                        if (s.excluded) continue;
                        if (s.base64) {
                            const e = this.replacePath(d, s.base64.replace(/\+/g, "\\+"), g.getFullUri(s), !0);
                            e && ((d = e), (p = d));
                            continue;
                        }
                        if (s === i || s.content || s.bytes || !s.uri) continue;
                        const e = g.getFullUri(s);
                        if (s.rootDir || g.fromSameOrigin(c, s.uri))
                            for (u = new RegExp(`(["'\\s\\n,=])(((?:\\.\\.)?(?:[\\\\/]\\.\\.|\\.\\.[\\\\/]|[\\\\/])*)?${t.join(s.pathname, s.filename).replace(/[\\/]/g, "[\\\\/]")})`, "g"); (f = u.exec(p)); )
                                f[2] !== e && s.uri === g.resolvePath(f[2], c) && (d = d.replace(f[0], f[1] + e));
                        const r = this.replacePath(d, s.uri, e);
                        r && (d = r), (p = d);
                    }
                    (d = d
                        .replace(/\s*<(script|link|style)[^>]+?data-chrome-file="exclude"[^>]*>[\s\S]*?<\/\1>\n*/gi, "")
                        .replace(/\s*<(script|link)[^>]+?data-chrome-file="exclude"[^>]*>\n*/gi, "")
                        .replace(/\s+data-(?:use|chrome-[\w-]+)="([^"]|\\")+?"/g, "")),
                        s.writeFileSync(r, (o && v.minifyHtml(o, d)) || d);
                    break;
                }
                case "text/html":
                case "application/xhtml+xml":
                    if (o) {
                        const e = v.minifyHtml(o, s.readFileSync(r).toString("utf8"));
                        e && s.writeFileSync(r, e);
                    }
                    break;
                case "text/css":
                case "@text/css": {
                    const e = !0 !== i.preserve && (null === (n = this.dataMap) || void 0 === n ? void 0 : n.unusedStyles),
                        t = "@" === a.charAt(0),
                        l = this.getTrailingContent(i);
                    if (!e && !t && !o) {
                        if (l)
                            try {
                                s.appendFileSync(r, l);
                            } catch (e) {
                                y.writeFail(r, e);
                            }
                        break;
                    }
                    const c = s.readFileSync(r).toString("utf8");
                    let f;
                    if (e) {
                        const t = v.removeCss(c, e);
                        t && (f = t);
                    }
                    if (t) {
                        const e = this.transformCss(i, f || c);
                        e && (f = e);
                    }
                    if (o) {
                        const e = v.minifyCss(o, f || c);
                        e && (f = e);
                    }
                    if ((l && (f ? (f += l) : (f = c + l)), f))
                        try {
                            s.writeFileSync(r, f);
                        } catch (e) {
                            y.writeFail(r, e);
                        }
                    break;
                }
                case "text/javascript":
                case "@text/javascript": {
                    const e = this.getTrailingContent(i);
                    if (!o) {
                        if (e)
                            try {
                                s.appendFileSync(r, e);
                            } catch (e) {
                                y.writeFail(r, e);
                            }
                        break;
                    }
                    const t = s.readFileSync(r).toString("utf8");
                    let n;
                    if (o) {
                        const e = v.minifyJs(o, t);
                        e && (n = e);
                    }
                    if ((e && (n ? (n += e) : (n = t + e)), n))
                        try {
                            s.writeFileSync(r, n);
                        } catch (e) {
                            y.writeFail(r, e);
                        }
                    break;
                }
                default:
                    if (a.includes("image/")) {
                        const e = (e, t) => {
                                r !== e && (t.includes("@") ? this.replace(i, e) : t.includes("%") && (this.filesToCompare.has(i) ? this.filesToCompare.get(i).push(e) : this.filesToCompare.set(i, [e])));
                            },
                            t = (e) => {
                                try {
                                    u.fromBuffer(s.readFileSync(e)).toBuffer((t, i) => {
                                        !t && i && s.writeFileSync(e, i), r !== e && this.finalize(e);
                                    });
                                } catch (t) {
                                    this.finalize(""), y.writeFail(e, t);
                                }
                            };
                        if ("image/unknown" === a)
                            ++this.delayed,
                                d
                                    .read(r)
                                    .then((t) => {
                                        const i = t.getMIME();
                                        switch (i) {
                                            case d.MIME_PNG:
                                            case d.MIME_JPEG:
                                            case d.MIME_BMP:
                                            case d.MIME_GIF:
                                            case d.MIME_TIFF:
                                                try {
                                                    const t = this.replaceExtension(r, i.split("/")[1]);
                                                    s.renameSync(r, t), e(t, "@"), this.finalize(t);
                                                } catch (e) {
                                                    this.finalize(""), y.writeFail(r, e);
                                                }
                                                break;
                                            default: {
                                                const i = this.replaceExtension(r, "png");
                                                t.write(i, (t) => {
                                                    t ? (this.finalize(""), y.writeFail(i, t)) : (e(i, "@"), this.finalize(i));
                                                });
                                            }
                                        }
                                    })
                                    .catch((e) => {
                                        this.finalize(""), y.writeFail(r, e);
                                    });
                        else {
                            const n = a.split(":");
                            n.pop();
                            for (const o of n) {
                                if (!w.withinSizeRange(r, o)) continue;
                                const n = b.parseResizeMode(o),
                                    l = b.parseOpacity(o),
                                    c = b.parseRotation(o);
                                let f = r;
                                const p = (e, t) => {
                                    a.endsWith("/" + e) ? o.includes("@") || ((f = this.replaceExtension(r, "__copy__." + (t || e))), s.copyFileSync(r, f)) : (f = this.replaceExtension(r, t || e));
                                };
                                o.startsWith("png")
                                    ? (++this.delayed,
                                      d
                                          .read(r)
                                          .then((s) => {
                                              p("png"),
                                                  n && b.resize(s, n.width, n.height, n.mode),
                                                  l && b.opacity(s, l),
                                                  c && b.rotate(s, f, c, this),
                                                  s.write(f, (s) => {
                                                      if (s) this.finalize(""), y.writeFail(f, s);
                                                      else {
                                                          if ((e(f, o), b.findCompress(i.compress))) return void t(f);
                                                          this.finalize(r !== f ? f : "");
                                                      }
                                                  });
                                          })
                                          .catch((e) => {
                                              this.finalize(""), y.writeFail(r, e);
                                          }))
                                    : o.startsWith("jpeg")
                                    ? (++this.delayed,
                                      d
                                          .read(r)
                                          .then((s) => {
                                              p("jpeg", "jpg"),
                                                  s.quality(w.jpeg_quality),
                                                  n && b.resize(s, n.width, n.height, n.mode),
                                                  c && b.rotate(s, f, c, this),
                                                  s.write(f, (s) => {
                                                      if (s) this.finalize(""), y.writeFail(f, s);
                                                      else {
                                                          if ((e(f, o), b.findCompress(i.compress))) return void t(f);
                                                          this.finalize(r !== f ? f : "");
                                                      }
                                                  });
                                          })
                                          .catch((e) => {
                                              this.finalize(""), y.writeFail(r, e);
                                          }))
                                    : o.startsWith("bmp") &&
                                      (++this.delayed,
                                      d
                                          .read(r)
                                          .then((t) => {
                                              p("bmp"),
                                                  n && b.resize(t, n.width, n.height, n.mode),
                                                  l && b.opacity(t, l),
                                                  c && b.rotate(t, f, c, this),
                                                  t.write(f, (t) => {
                                                      t ? (this.finalize(""), y.writeFail(f, t)) : (e(f, o), this.finalize(r !== f ? f : ""));
                                                  });
                                          })
                                          .catch((e) => {
                                              this.finalize(""), y.writeFail(r, e);
                                          }));
                            }
                        }
                    }
            }
        }
        getTrailingContent(e) {
            var t;
            let i = "";
            const s = e.trailingContent;
            if (s) {
                const r = null === (t = this.dataMap) || void 0 === t ? void 0 : t.unusedStyles,
                    n = e.mimeType;
                for (const t of s) {
                    let s = t.value;
                    if (n) {
                        if (n.endsWith("text/css")) {
                            if (r && !t.preserve) {
                                const e = v.removeCss(s, r);
                                e && (s = e);
                            }
                            if ("@" === n.charAt(0)) {
                                const t = this.transformCss(e, s);
                                t && (s = t);
                            }
                        }
                        if (t.format) {
                            const e = v.formatContent(s, n, t.format);
                            if (e) {
                                i += "\n" + e;
                                continue;
                            }
                        }
                    }
                    i += "\n" + s;
                }
            }
            return i || void 0;
        }
        transformCss(e, t) {
            const i = e.uri;
            let s;
            if (this.requestMain && g.fromSameOrigin(this.requestMain.uri, i)) {
                const r = this.assets;
                for (const i of r)
                    if (i.base64 && i.uri && !i.excluded) {
                        const s = this.getRelativeUrl(e, i.uri);
                        if (s) {
                            const e = this.replacePath(t, i.base64.replace(/\+/g, "\\+"), s, !0);
                            e && (t = e);
                        }
                    }
                const n = /[uU][rR][lL]\(([^)]+)\)/g;
                let a;
                for (; (a = n.exec(t)); ) {
                    const n = a[1].trim().replace(/^["']/, "").replace(/["']$/, "").trim();
                    if (!y.isFileURI(n) || g.fromSameOrigin(i, n)) {
                        let i = this.getRelativeUrl(e, n);
                        if (i) s = (s || t).replace(a[0], `url(${i})`);
                        else if (((i = g.resolvePath(n, this.requestMain.uri)), i)) {
                            r.find((e) => e.uri === i && !e.excluded) && ((i = this.getRelativeUrl(e, i)), i && (s = (s || t).replace(a[0], `url(${i})`)));
                        }
                    } else {
                        const i = r.find((e) => e.uri === n && !e.excluded);
                        if (i) {
                            const r = e.pathname.split(/[\\/]/).length;
                            s = (s || t).replace(a[0], `url(${(r > 0 ? "../".repeat(r) : "") + g.getFullUri(i)})`);
                        }
                    }
                }
            }
            return s;
        }
        writeBuffer(e, t, i) {
            const r = b.findCompress(t.compress);
            if (r && w.withinSizeRange(i, r.condition))
                try {
                    u.fromBuffer(s.readFileSync(i)).toBuffer((r, n) => {
                        !r && n && s.writeFileSync(i, n), b.isJpeg(t) && w.removeFormat(t.compress, "jpeg"), this.compressFile(e, t, i);
                    });
                } catch (s) {
                    this.compressFile(e, t, i), y.writeFail(i, s);
                }
            else this.compressFile(e, t, i);
        }
        processAssetsSync(e) {
            const i = new Set(),
                r = {},
                n = {},
                a = {},
                o = [],
                c = this.assets,
                f = c[0].exclusions,
                p = (e, t, i) => {
                    const s = e.bundleIndex;
                    if (void 0 !== s) return a[t] || (a[t] = []), 0 !== s && (a[t].push(e), !0);
                    if (!i) {
                        if (o.includes(t)) return this.writeBuffer(c, e, t), this.finalize(""), !0;
                        {
                            const i = n[t];
                            return i ? (++this.delayed, i.push(e), !0) : ((n[t] = [e]), !1);
                        }
                    }
                    return !1;
                },
                u = (e, t, i) => {
                    var f;
                    if (void 0 !== e.bundleIndex) {
                        if (0 === e.bundleIndex)
                            if (w.getFileSize(t) > 0 && !e.excluded) {
                                const i = this.appendContent(e, s.readFileSync(t).toString("utf8"), !0);
                                if (i)
                                    try {
                                        s.writeFileSync(t, i, "utf8");
                                    } catch (e) {
                                        y.writeFail(t, e);
                                    }
                            } else {
                                e.excluded = !0;
                                const i = this.getTrailingContent(e);
                                if (i)
                                    try {
                                        s.writeFileSync(t, i, "utf8"), (e.excluded = !1);
                                    } catch (e) {
                                        y.writeFail(t, e);
                                    }
                            }
                        const n = null === (f = a[t]) || void 0 === f ? void 0 : f.shift();
                        if (n) {
                            const a = n.uri,
                                o = (e) => {
                                    if (w.getFileSize(t) > 0) this.appendContent(n, e);
                                    else {
                                        const r = this.appendContent(n, e, !0);
                                        if (r)
                                            try {
                                                s.writeFileSync(t, r, "utf8"), (n.bundleIndex = 1 / 0), (i = n);
                                            } catch (e) {
                                                (n.excluded = !0), y.writeFail(t, e);
                                            }
                                    }
                                };
                            n.content
                                ? o(n.content)
                                : a &&
                                  l(a, (e, t) => {
                                      if (e) (r[a] = !0), (n.excluded = !0), y.writeFail(a, e);
                                      else {
                                          const e = t.statusCode;
                                          e >= 300 ? ((r[a] = !0), (n.excluded = !0), y.writeFail(a, e + " " + t.statusMessage)) : o(t.body);
                                      }
                                  }),
                                u(n, t, !i || i.excluded ? (!e.excluded && e) || n : i);
                        } else w.getFileSize(t) > 0 ? (this.compressFile(c, i || e, t), this.finalize(t)) : (((i || e).excluded = !0), this.finalize(""));
                    } else if (Array.isArray(n[t])) {
                        o.push(t);
                        for (const e of n[t]) e.excluded ? this.finalize("") : (this.writeBuffer(c, e, t), this.finalize(t));
                        delete n[t];
                    } else this.writeBuffer(c, e, t), this.finalize(t);
                },
                h = (e, t, i, o) => {
                    var l;
                    const c = e.uri;
                    if ((r[c] || ((null === (l = a[t]) || void 0 === l ? void 0 : l.length) ? u(e, t) : this.finalize(""), (r[c] = !0)), o))
                        try {
                            o.close(), s.unlinkSync(t);
                        } catch (e) {}
                    (e.excluded = !0), y.writeFail(c, i), delete n[t];
                };
            for (const n of c) {
                if (f && !this.validate(n, f)) {
                    n.excluded = !0;
                    continue;
                }
                const { pathname: o, filepath: m } = this.getFileOutput(n),
                    g = (e) => {
                        var t;
                        e && (n.excluded = !0), !e || (null === (t = a[m]) || void 0 === t ? void 0 : t.length) ? u(n, m) : this.finalize("");
                    };
                if (!i.has(o)) {
                    if (e)
                        try {
                            s.emptyDirSync(o);
                        } catch (e) {
                            y.writeFail(o, e);
                        }
                    if (!s.existsSync(o))
                        try {
                            s.mkdirpSync(o);
                        } catch (e) {
                            (n.excluded = !0), y.writeFail(o, e);
                        }
                    i.add(o);
                }
                if (n.content) {
                    if (p(n, m, !0)) continue;
                    ++this.delayed, s.writeFile(m, n.content, "utf8", (e) => g(e));
                } else if (n.base64)
                    ++this.delayed,
                        s.writeFile(m, n.base64, "base64", (e) => {
                            e ? ((n.excluded = !0), this.finalize("")) : (this.writeBuffer(c, n, m), this.finalize(m));
                        });
                else if (n.bytes) {
                    const { width: e, height: t } = n;
                    e &&
                        t &&
                        (++this.delayed,
                        new d({ width: e, height: t, data: Uint8Array.from(n.bytes) }, (e, t) => {
                            e
                                ? ((n.excluded = !0), this.finalize(""))
                                : t.write(m, (e) => {
                                      e ? (this.finalize(""), y.writeFail(m, e)) : (this.writeBuffer(c, n, m), this.finalize(m));
                                  });
                        }));
                } else {
                    const e = n.uri;
                    if (!e || r[e]) {
                        n.excluded = !0;
                        continue;
                    }
                    try {
                        if (y.isFileURI(e)) {
                            if (p(n, m)) continue;
                            const t = s.createWriteStream(m);
                            t.on("finish", () => {
                                r[e] || u(n, m);
                            }),
                                ++this.delayed,
                                l(e)
                                    .on("response", (e) => {
                                        const i = e.statusCode;
                                        i >= 300 && h(n, m, i + " " + e.statusMessage, t);
                                    })
                                    .on("error", (e) => h(n, m, e, t))
                                    .pipe(t);
                        } else if (y.unc_read && y.isFileUNC(e)) {
                            if (p(n, m)) continue;
                            ++this.delayed, s.copyFile(e, m, (e) => g(e));
                        } else if (y.disk_read && t.isAbsolute(e)) {
                            if (p(n, m)) continue;
                            ++this.delayed, s.copyFile(e, m, (e) => g(e));
                        } else n.excluded = !0;
                    } catch (e) {
                        h(n, m, e);
                    }
                }
            }
        }
        finalizeAssetsAsync(e) {
            const t = this.filesToRemove;
            for (const [e, i] of this.filesToCompare) {
                const s = e.filepath;
                let r = s,
                    n = w.getFileSize(r);
                for (const e of i) {
                    const i = w.getFileSize(e);
                    i > 0 && i < n ? (t.add(r), (r = e), (n = i)) : t.add(e);
                }
                r !== s && this.replace(e, r);
            }
            const i = this.dirname.length;
            for (const e of this.filesToRemove) {
                this.files.delete(e.substring(i + 1));
                try {
                    s.existsSync(e) && s.unlinkSync(e);
                } catch (t) {
                    y.writeFail(e, t);
                }
            }
            for (const [e, t] of this.contentToAppend.entries()) {
                let i = "";
                for (const e of t) e && (i += "\n" + e);
                s.existsSync(e) ? s.appendFileSync(e, i) : s.writeFileSync(e, i);
            }
            return ((r = () => {
                const t = this.assets.filter((e) => e.originalName);
                if (t.length > 0 || e)
                    for (const i of this.assets) {
                        if (i.excluded) continue;
                        const { filepath: r, mimeType: n } = i;
                        if (r)
                            switch (n) {
                                case "@text/html":
                                case "@application/xhtml+xml":
                                case "@text/css":
                                case "&text/css":
                                    s.readFile(r, (i, n) => {
                                        if (!i) {
                                            let i = n.toString("utf-8");
                                            for (const e of t) i = i.replace(new RegExp(g.getFullUri(e, e.originalName).replace(/[\\/]/g, "[\\\\/]"), "g"), g.getFullUri(e));
                                            e && (i = i.replace(/(\.\.\/)*__serverroot__/g, "")), s.writeFileSync(r, i);
                                        }
                                    });
                            }
                    }
            }),
            (...e) =>
                new Promise((t, i) => {
                    try {
                        t(r.call(null, ...e));
                    } catch (e) {
                        i(e);
                    }
                }))();
            var r;
        }
    }
    m.post("/api/assets/copy", (e, i) => {
        const s = t.normalize(e.query.to);
        if (s) {
            if (!y.checkPermissions(i, s)) return;
            let t = !1;
            const r = new x(s, e.body, function (s) {
                this.delayed !== 1 / 0 &&
                    (s && this.add(s),
                    (void 0 === s || (0 == --this.delayed && t)) &&
                        this.finalizeAssetsAsync("1" === e.query.release).then(() => {
                            i.json({ success: this.files.size > 0, files: Array.from(this.files) }), (this.delayed = 1 / 0);
                        }));
            });
            try {
                r.processAssetsSync("1" === e.query.empty), 0 === r.delayed ? r.finalize() : (t = !0);
            } catch (e) {
                i.json({ application: "FILE: Unknown", system: e });
            }
        }
    }),
        m.post("/api/assets/archive", (e, i) => {
            const r = e.query.to ? t.normalize(e.query.to) : "",
                n = t.join(__dirname, "temp" + t.sep + c.v4());
            let a;
            try {
                if ((s.mkdirpSync(n), r)) {
                    if (!y.checkPermissions(i, r)) return;
                    a = r;
                } else (a = n + "-zip"), s.mkdirpSync(a);
            } catch (e) {
                return void i.json({ application: "DIRECTORY: " + n, system: e });
            }
            let o,
                d = e.query.append_to,
                u = "",
                m = !1,
                g = !1;
            switch ((t.isAbsolute(d) && (d = t.normalize(d)), e.query.format)) {
                case "gz":
                case "tgz":
                    g = !0;
                case "tar":
                    o = "tar";
                    break;
                default:
                    o = "zip";
            }
            const v = f(o, { zlib: { level: w.gzip_level } }),
                b = new x(n, e.body, function (t) {
                    this.delayed !== 1 / 0 &&
                        (t && this.add(t),
                        (void 0 === t || (0 == --this.delayed && m)) &&
                            this.finalizeAssetsAsync("1" === e.query.release).then(() => {
                                v.directory(n, !1), v.finalize();
                            }));
                }),
                F = (n = "") => {
                    u = t.join(a, (e.query.filename || u || c.v4()) + "." + o);
                    const l = s.createWriteStream(u);
                    l.on("close", () => {
                        const t = b.files.size > 0,
                            s = v.pointer(),
                            n = { success: t, files: Array.from(b.files) };
                        if ((r || ((n.zipname = u), (n.bytes = s)), g && t)) {
                            const t = "tgz" === e.query.format ? u.replace(/tar$/, "tgz") : u + ".gz";
                            w.createGzipWriteStream(u, t)
                                .on("finish", () => {
                                    const e = w.getFileSize(t);
                                    r || ((n.zipname = t), (n.bytes = e)), i.json(n), console.log(`${h.blue("WRITE")}: ${t} ${h.yellow("[") + h.grey(e + " bytes") + h.yellow("]")}`);
                                })
                                .on("error", (e) => {
                                    (n.success = !1), i.json(n), y.writeFail(t, e);
                                });
                        } else i.json(n);
                        (b.delayed = 1 / 0), console.log(`${h.blue("WRITE")}: ${u} ${h.yellow("[") + h.grey(s + " bytes") + h.yellow("]")}`);
                    }),
                        v.pipe(l);
                    try {
                        n && v.directory(n, !1), b.processAssetsSync(!1), 0 === b.delayed ? (b.processAssetsSync(!1), b.finalize()) : (m = !0);
                    } catch (e) {
                        i.json({ application: "FILE: Unknown", system: e });
                    }
                };
            if (d) {
                const e = /([^/\\]+)\.(zip|tar)$/i.exec(d);
                if (e) {
                    const r = t.join(a, e[0]),
                        n = () => {
                            u = e[1];
                            const i = t.join(a, u);
                            p(r, i)
                                .then(() => {
                                    (o = e[2].toLowerCase()), F(i);
                                })
                                .catch((e) => {
                                    y.writeFail(r, e), F();
                                });
                        };
                    try {
                        if (y.isFileURI(d)) {
                            const e = s.createWriteStream(r);
                            return (
                                e.on("finish", n),
                                void l(d)
                                    .on("response", (e) => {
                                        const t = e.statusCode;
                                        t >= 300 && (y.writeFail(r, new Error(t + " " + e.statusMessage)), F());
                                    })
                                    .on("error", (e) => {
                                        y.writeFail(r, e), F();
                                    })
                                    .pipe(e)
                            );
                        }
                        if (s.existsSync(d)) {
                            if (y.isFileUNC(d)) {
                                if (!y.unc_read) return void i.json({ application: "OPTION: --unc-read", system: "Reading from UNC shares is not enabled." });
                            } else if (!y.disk_read && t.isAbsolute(d)) return void i.json({ application: "OPTION: --disk-read", system: "Reading from disk is not enabled." });
                            return void s.copyFile(d, r, n);
                        }
                        y.writeFail(d, new Error("Archive not found."));
                    } catch (e) {
                        y.writeFail(r, e);
                    }
                } else y.writeFail(d, new Error("Invalid archive format."));
            }
            F();
        }),
        m.get("/api/browser/download", (e, t) => {
            const i = e.query.filepath;
            i
                ? t.sendFile(i, (e) => {
                      e && y.writeFail(i, e);
                  })
                : t.json(null);
        });
})();
