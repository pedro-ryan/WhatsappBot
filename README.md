<h1 align="center">💬WhatsappBot🤖</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/prgames123/WhatsappBot"/>
  <img src="https://img.shields.io/github/last-commit/prgames123/WhatsappBot"/>
  <img src="https://img.shields.io/github/languages/top/prgames123/WhatsappBot"/>
</p>

<p align="center">
  Um Simples Bot de Whatsapp 4Fun, Usando a Biblioteca
  <a href="https://github.com/adiwajshing/Baileys">
    💬 Baileys 💭
  </a>
</p>

<p align="center">
 <a href="#comandos">Funções</a> •
 <a href="#objetivosfeatures">Features</a> •
 <a href="#executar-o-bot">Executar o Bot</a>
</p>

<h3 align="center">
	🚧  Em construção...  🚧
</h3>

---

## Comandos

<!--
  EMOJIS :p
  :x:
  :heavy_check_mark:
 -->

| Comando    | Uso                                   | Descrição                                     |    Funcionando     |
| ---------- | ------------------------------------- | --------------------------------------------- | :----------------: |
| **!oi**    | **!oi**                               | Manda um Olá                                  | :heavy_check_mark: |
| **!list**  | **!list**                             | Cria uma lista                                | :heavy_check_mark: |
| **!play**  | **!play** <_Nome do Vídeo ou Musica_> | Baixa e Envia o Áudio de Um Vídeo do Youtube  |        :x:         |
| **!image** | **!image** <_Termo da Pesquisa_>      | Baixa e Envia Imagens com o termo de Pesquisa |        :x:         |
| **!help**  | **!help** <_Comando_>                 | Dá um resumo Sobre Algum Comando              |        :x:         |

# Objetivos/Features

|      **Bot**       |                     **Features**                     |
| :----------------: | :--------------------------------------------------: |
| :heavy_check_mark: |         Adicionar Comando Para Mandar Olá :D         |
| :heavy_check_mark: |          Adicionar command para criar lista          |
|        :x:         |         Adicionar Comando Para Baixar Musica         |
|        :x:         |         Adicionar Comando Para Baixar Imagem         |
|        :x:         |              Adicionar Comando de Ajuda              |
|        :x:         | Adicionar Comando Para Converter Imagem em Figurinha |
| :heavy_check_mark: |                   Rodar no Docker                    |

|     **!list**      |                         **Feature**                          |          **Use**           |
| :----------------: | :----------------------------------------------------------: | :------------------------: |
| :heavy_check_mark: |         Enviar pequena lista com texto centralizado          |           !list            |
| :heavy_check_mark: | Adicionar botões para adicionar ou remover seu nome na lista |             -              |
| :heavy_check_mark: | Adicionar subcomando para renomear nome na lista (_rename_)  | !list rename <_novo nome_> |
|        :x:         |         Adicionar comando criar lista personalizada          |             -              |
|        :x:         |            Criar persistência de dados nas listas            |             -              |
|        :x:         |             Fazer com que listas sejam por grupo             |             -              |

| **!play** |            **Feature**            |       **Use**        |
| :-------: | :-------------------------------: | :------------------: |
|    :x:    |      flag para enviar Vídeo       |   !play ... -video   |
|    :x:    |     Baixar Musica do Youtube      | !play <_video name_> |
|    :x:    |     Confirmação para Donwload     |          -           |
|    :x:    |    Baixar Playlist do Youtube     |          -           |
|    :x:    | Baixar Musica/Playlist do Spotify |          -           |

# Executar o Bot

## Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com), [Node.js](https://nodejs.org/en/), [Python](https://www.python.org/).

E é bom ter um Editor de Código, O que eu Uso e Recomendo é o [VSCode](https://code.visualstudio.com/)

## Rodando o Bot

```bash
| 1. Faça um Clone deste repositório
$ git clone https://github.com/pedro-ryan/WhatsappBot

| 2. Acesse a pasta do projeto no terminal/cmd
$ cd WhatsappBot

| 3. Instale as dependências
$ npm install

| 4. Execute a aplicação
$ npm start

```
