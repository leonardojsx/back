# Use a imagem oficial do Node.js como base
FROM node:20.12.2

# Configure o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie o arquivo package.json e package-lock.json para o contêiner
COPY package*.json ./

# Instale as dependências do npm
RUN npm install

# Copie o restante do código-fonte para o contêiner
COPY . .

# Exponha a porta que sua aplicação Node.js está ouvindo
EXPOSE 3000

# Comando para iniciar sua aplicação quando o contêiner for iniciado
CMD ["node", "./server.js"]