import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stocks = [
  ["MAYBANK", "1155.KL", "Malayan Banking Berhad", "Financial Services"],
  ["CIMB", "1023.KL", "CIMB Group Holdings Berhad", "Financial Services"],
  ["TENAGA", "5347.KL", "Tenaga Nasional Berhad", "Utilities"],
  ["PBBANK", "1295.KL", "Public Bank Berhad", "Financial Services"],
  ["BURSA", "1818.KL", "Bursa Malaysia Berhad", "Financial Services"],
  ["TM", "4863.KL", "Telekom Malaysia Berhad", "Telecommunications"],
  ["MAXIS", "6012.KL", "Maxis Berhad", "Telecommunications"],
  ["AXIATA", "6888.KL", "Axiata Group Berhad", "Telecommunications"],
  ["IHH", "5225.KL", "IHH Healthcare Berhad", "Healthcare"],
  ["TOPGLOV", "7113.KL", "Top Glove Corporation Berhad", "Healthcare"],
  ["HARTA", "5168.KL", "Hartalega Holdings Berhad", "Healthcare"],
  ["PCHEM", "5183.KL", "Petronas Chemicals Group Berhad", "Industrial Products"],
  ["MRDIY", "5296.KL", "MR D.I.Y. Group (M) Berhad", "Consumer Products"],
  ["HLBB", "5819.KL", "Hong Leong Bank Berhad", "Financial Services"],
  ["IOICORP", "1961.KL", "IOI Corporation Berhad", "Plantation"],
  ["KLK", "2445.KL", "Kuala Lumpur Kepong Berhad", "Plantation"],
  ["SIMEPLT", "5285.KL", "Sime Darby Plantation Berhad", "Plantation"],
  ["SIMEPROP", "5288.KL", "Sime Darby Property Berhad", "Property"],
  ["DIALOG", "7277.KL", "Dialog Group Berhad", "Energy"],
  ["GENTING", "3182.KL", "Genting Berhad", "Consumer Services"],
  ["GENM", "4715.KL", "Genting Malaysia Berhad", "Consumer Services"],
  ["PETDAG", "5681.KL", "Petronas Dagangan Berhad", "Consumer Products"],
  ["PETGAS", "6033.KL", "Petronas Gas Berhad", "Utilities"],
  ["MISC", "3816.KL", "MISC Berhad", "Transportation"],
  ["AIRPORT", "5014.KL", "Malaysia Airports Holdings Berhad", "Transportation"],
  ["PMETAL", "8869.KL", "Press Metal Aluminium Holdings Berhad", "Industrial Products"]
] as const;

const defaultWatchlist = new Map([
  ["MAYBANK", { priority: 1, watchStatus: "On Radar", personalNote: "Core banking counter for watchlist memory." }],
  ["CIMB", { priority: 2, watchStatus: "Momentum Watch", personalNote: "Track banking momentum and volume." }],
  ["TENAGA", { priority: 3, watchStatus: "On Radar", personalNote: "Utility baseline for market tone." }],
  ["PBBANK", { priority: 4, watchStatus: "Calm", personalNote: "Defensive finance reference." }],
  ["BURSA", { priority: 5, watchStatus: "On Radar", personalNote: "Market operator proxy." }],
  ["TM", { priority: 6, watchStatus: "On Radar", personalNote: "Telecom trend watch." }],
  ["IHH", { priority: 7, watchStatus: "On Radar", personalNote: "Healthcare large-cap watch." }],
  ["PCHEM", { priority: 8, watchStatus: "On Radar", personalNote: "Energy chemicals cycle watch." }],
  ["MRDIY", { priority: 9, watchStatus: "On Radar", personalNote: "Retail growth counter." }],
  ["PMETAL", { priority: 10, watchStatus: "On Radar", personalNote: "Industrial momentum watch." }]
]);

async function main() {
  for (const [symbol, yahooSymbol, companyName, sector] of stocks) {
    const stock = await prisma.stock.upsert({
      where: { yahooSymbol },
      update: {
        symbol,
        companyName,
        sector,
        market: "Bursa Malaysia",
        isActive: true
      },
      create: {
        symbol,
        yahooSymbol,
        companyName,
        sector,
        market: "Bursa Malaysia",
        isActive: true
      }
    });

    const watch = defaultWatchlist.get(symbol);
    if (watch) {
      await prisma.watchlistItem.upsert({
        where: { stockId: stock.id },
        update: watch,
        create: {
          stockId: stock.id,
          ...watch
        }
      });
    }
  }

  console.log(`Seeded ${stocks.length} Bursa stocks and ${defaultWatchlist.size} watchlist rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
