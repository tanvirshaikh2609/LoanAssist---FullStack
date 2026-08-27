import atlasImage from '../assets/Atlas Credit Card axis bank.jpeg';
import eternaImage from '../assets/Eterna Credit Card bob.jpeg';
import firstMillenniaImage from '../assets/FIRST Millennia Credit Card idfc.jpeg';
import firstSelectImage from '../assets/FIRST Select Credit Card idfc.jpeg';
import flipkartAxisImage from '../assets/Flipkart Axis Bank Credit Card.jpeg';
import legendImage from '../assets/Legend Credit Card induslnd bank.jpeg';
import magnusImage from '../assets/Magnus Credit Card hdfc.jpeg';
import millenniaImage from '../assets/Millennia Credit Card hdfc.jpeg';
import platinumRuPayImage from '../assets/Platinum RuPay Credit Card union bank.jpeg';
import regaliaGoldImage from '../assets/Regalia Gold Credit Card hdfc.jpeg';
import rupaySelectImage from '../assets/RuPay Select Credit Card pnb bank.jpeg';
import sbiEliteImage from '../assets/SBI Card ELITE.jpeg';
import sapphiroImage from '../assets/Sapphiro Credit Card icici.jpeg';
import simplyClickImage from '../assets/SimplyCLICK SBI Card.jpeg';
import simplySaveImage from '../assets/SimplySAVE SBI Card.jpeg';
import standardImage from '../assets/Standard Credit Card canara bank.jpeg';
import zenSignatureImage from '../assets/Zen Signature Credit Card kotak.jpeg';
import amazonPayImage from '../assets/amazonpayicicicreditcard.jpeg';
import hdfcInfiniaImage from '../assets/hdfcinfinia.jpeg';

export const getCardImage = (cardName) => {
  if (!cardName) return null;
  const lower = cardName.toLowerCase();
  
  if (lower.includes("amazon pay")) return amazonPayImage;
  if (lower.includes("infinia")) return hdfcInfiniaImage;
  if (lower.includes("atlas")) return atlasImage;
  if (lower.includes("eterna")) return eternaImage;
  if (lower.includes("first millennia")) return firstMillenniaImage;
  if (lower.includes("first select")) return firstSelectImage;
  if (lower.includes("flipkart")) return flipkartAxisImage;
  if (lower.includes("legend")) return legendImage;
  if (lower.includes("magnus")) return magnusImage;
  if (lower.includes("millennia")) return millenniaImage;
  if (lower.includes("platinum rupay")) return platinumRuPayImage;
  if (lower.includes("regalia")) return regaliaGoldImage;
  if (lower.includes("rupay select")) return rupaySelectImage;
  if (lower.includes("sapphiro")) return sapphiroImage;
  if (lower.includes("elite")) return sbiEliteImage;
  if (lower.includes("simplyclick")) return simplyClickImage;
  if (lower.includes("simplysave")) return simplySaveImage;
  if (lower.includes("standard")) return standardImage;
  if (lower.includes("zen")) return zenSignatureImage;
  
  return null;
};
