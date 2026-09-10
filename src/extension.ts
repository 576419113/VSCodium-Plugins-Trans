import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
export function activate(context: vscode.ExtensionContext) {
    const plugins_path = vscode.workspace.getConfiguration("vscodium-trans").get<string>("vscodium-plugins-path", "")
    const me_path = path.join(plugins_path, "geokung.vscodium-plugins-trans-1.0.0")
    // 将扩展的 package.nls.json 导出
    let export_command = vscode.commands.registerCommand("vscodium-trans.nls-export", () => {
        fs.readdir(plugins_path, (err, dirs) => {
            if (err) {
                console.error("Error in reading directory: ", err)
                return
            }
            for (const dir of dirs) {
                fs.access(path.join(plugins_path, dir, "package.nls.json"), fs.constants.F_OK, (err) => {
                    if (!err) {
                        let raw = fs.readFileSync(path.join(plugins_path, dir, "package.json"), "utf-8")
                        let data = JSON.parse(raw)
                        let name = data["name"]
                        let publisher = data["publisher"]
                        fs.cpSync(path.join(plugins_path, dir, "package.nls.json"), path.join(me_path, "plugins", publisher + "." + name + ".json"))
                        fs.access(path.join(plugins_path, dir, "package.nls.zh-cn.json"), fs.constants.F_OK, (err) => {
                            fs.cpSync(path.join(plugins_path, dir, "package.nls.zh-cn.json"), path.join(me_path, "plugins", publisher + "." + name + ".zh-cn.json"))
                        })
                    }
                })
            }
        })
    });
    context.subscriptions.push(export_command)
    // 导入编辑好的 package.nls.zh-cn.json
    let import_command = vscode.commands.registerCommand("vscodium-trans.nls-import", () => {
        let heads:string[] = []
        fs.readdir(path.join(me_path, "plugins"), (err, files) => {
            if (err) {
                console.error("Error in reading directory: ", err)
                return
            }
            for (const file of files) {
                if (file.endsWith(".zh-cn.json")) {
                    heads.push(file.slice(0, -11))
                }
            }
        })
        fs.readdir(plugins_path, (err, dirs) => {
            if (err) {
                console.error("Error in reading directory: ", err)
                return
            }
            for (const dir of dirs) {
                for (const head of heads) {
                    if (dir.startsWith(head)) {
                        fs.cpSync(path.join(me_path, "plugins", head + ".zh-cn.json"), path.join(plugins_path, dir, "package.nls.zh-cn.json"))
                        break
                    }
                }
            }
        })
    })
    context.subscriptions.push(import_command)
}

export function deactivate() { }
