---
title: Neovim
description: A guide to configuring Neovim.
date: 1/4/2023
---

[Neovim](https://neovim.io/) is a highly configurable text editor inspired by Vim. If you aren't familiar with Vim, it's a keyboard-centered, modal editor that allows for intuitive editing. If you want to learn how to use it, install it, open it, and then type `:Tutor` to go through a tutorial. After a long time of using LazyVim, a Neovim "distribution" (premade configuration), I decided to write my own Neovim configuration. It was challenging but worth it in the end. Since many people struggle with this, I wrote this article as an opinionated overview on how to configure Neovim. As a disclaimer, I do reference Unix commands often that only work on Unix systems like MacOS, Linux, BSD, etc. If you use Windows, you will have to find the equivalent commands for these. Personally, I use Windows but I have WSL installed, which allows you to run an integrated Linux environment in Windows. You also need some basic utilities like git installed. 

# Introduction

Neovim is usually configured in Lua but my config (which can be found [here](https://github.com/kritdass/nvim-config)) uses [Fennel](https://fennel-lang.org/), which is a Lisp dialect that compiles to Lua. If you want to use Lua instead, you can reference the `lua/` directory of my config, which has the compiled Lua code (albeit ugly). First, let's make the folder that will house our Neovim config.

```sh
mkdir -p $HOME/.config/nvim
cd $HOME/.config/nvim
```

Then, let's make an init.lua file. 
 
 ```sh
touch init.lua
```

Since we are using Fennel, this file will only bootstrap some necessary things. Here is my `init.lua`:

```fennel
local function bootstrap(url, ref)
    local name = url:gsub(".*/", "")
    local path = vim.fn.stdpath("data") .. "/lazy/" .. name
    vim.opt.rtp:prepend(path)

    if vim.fn.isdirectory(path) == 0 then
        print(name .. ": installing in data dir...")

        vim.fn.system({ "git", "clone", "--filter=blob:none", url, path })
        if ref then
            vim.fn.system({ "git", "-C", path, "checkout", ref })
        end

        vim.cmd("redraw")
        print(name .. ": finished installing")
    end
end

bootstrap("https://github.com/folke/lazy.nvim", "v10.15")
bootstrap("https://github.com/udayvir-singh/tangerine.nvim", "v2.8")
bootstrap("https://github.com/udayvir-singh/hibiscus.nvim", "v1.7")

require("tangerine").setup({
    compiler = {
        verbose = false,
        hooks = { "onsave", "oninit" },
    },
})
```

This code bootstraps the following:

- [lazy.nvim](https://github.com/folke/lazy.nvim): a Neovim package manager that supports lazy-loading
- [tangerine.nvim](https://github.com/udayvir-singh/tangerine.nvim): provides Fennel integration in Neovim
- [hibiscus.nvim](https://github.com/udayvir-singh/hibiscus.nvim): provides Fennel macros for configuring Neovim

 I also add a hook in tangerine to compile the Fennel into Lua everytime I save a Fennel file or open Neovim. Let's also make a directory to store our Fennel config files. 
 
 ```sh
 mkdir fnl
 ```
 
 # init.fnl
 
Now, let's actually start configuring Neovim. If you are following this in Lua, you will want to still put this in `init.lua` but we will put this in `init.fnl`. Let's make the file first: 

```sh
touch init.fnl
```

This is my `init.fnl`:

```fennel
(local lazy (require :lazy))
(import-macros {: g!} :hibiscus.vim)

(g! :mapleader " ")
(g! :maplocalleader "\\")

(lazy.setup :plugins {:performance {:reset_packpath false}})

(require :config)
```

 First, we setup the leader keys before setting up any plugins. Then, we setup lazy.nvim with our plugins (it will look in the `fnl/plugins/` which we will worry about later). Also, if you are using Fennel, remember to set `reset_packpath` to false as this can mess with tangerine. Lastly, we require config (really `fnl/config/`), which we will also setup later. 
 
 # Macros
 
Macros are, in my opinion, the best part of using a Lisp dialect. Hibiscus already provides some macros but you are free to define some of your own. Here are some I have in my `fnl/macros.fnl`:

```fennel
(fn hl! [group val]
    `(vim.api.nvim_set_hl 0 ,group ,val))

(fn plug! [plugin ?opts]
    (doto (or ?opts {}) (tset 1 plugin)))

(fn require! [plugin item]
    `(. (require ,plugin) ,item))

(fn vim! [cmd]
    (sym (.. :vim. cmd)))

{: hl! : plug! : require! : vim!}
```

These are simple macros that save some keystrokes. The `plug!` macro may be confusing but all it does is it avoids Fennel's ugly syntax for mixed tables and allows you to write Lazy plugin specs as `(plug! package opts)` instead of `{1 package ...}`.

# Config

 This directory will house our Neovim configuration (excluding plugins). 
 
 ```sh
 mkdir fnl/config
 cd fnl/config
 ```
 
 Now, let's make an `init.fnl` file.
 
 ```sh
 touch init.fnl
 ```

All this file does is exports all the other files in this directory so that we only have to import `config` in our `init.fnl`. It is very similar to `index.js` in JavaScript or `__init__.py` in Python. My `fnl/config/init.fnl` file looks like this: 

```fennel
(require :config.options)
(require :config.keymaps)
(require :config.highlights)
(require :config.autocmds)
```

 Whenever you make a new file in `fnl/config/`, just remember to import it in `init.fnl`. My config is quite long so I won't put it here, but you can see it in my repository. 
 
 # Plugins
 
 Let's make a plugins folder first.
 
 ```sh
 mkdir fnl/plugins
 cd fnl/plugins
 ```
 
All our plugin specs will go here. Unlike `fnl/config/`, we do not need an `init.fnl` file because Lazy will automatically load all the files in this directory. I use a _ton_ of plugins so I won't go over them all. However, I've seen that most people struggle most with configuring LSP (Language Server Protocol), so I'll go over that briefly.

My configuration includes automatic setup of LSP servers. I do this with a combination of the following: 
 
- [mason](https://github.com/williamboman/mason.nvim): allows for easy installation of LSP servers
- [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig): for configuring LSP servers
- [mason-lspconfig](https://github.com/williamboman/mason-lspconfig.nvim): integrates Mason with nvim-lspconfig for automatic configuration
- [nvim-cmp](https://github.com/hrsh7th/nvim-cmp): for completion (this has many dependencies of its own that allow completion for different things)

If this seems too daunting for you, there's also [lsp-zero](https://github.com/lazy-nvim/lsp-zero) which provides an easy and painless way to configure LSP. Their [guide](https://github.com/VonHeikemen/lsp-zero.nvim/blob/v3.x/doc/md/guides/you-might-not-need-lsp-zero.md) for configuring LSP without lsp-zero is also good if you don't want to use it. 
 
# Conclusion

Configuring Neovim can be challenging but the best way to go about it is to break it down and configure one thing at a time. If you are still unsure about anything, just reference my [config](https://github.com/kritdass/nvim-config) or anyone else's. I personally used LazyVim as a reference when I was writing mine. Good luck!
