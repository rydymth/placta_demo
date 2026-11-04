process.loadEnvFile()

const ports = Number(process.env.PORT) || 6969;

const packs = {
  ports
}

export default packs;
