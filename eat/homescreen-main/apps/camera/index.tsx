import { Screen } from "../../components/Screen";
import { Main } from "../../components/Main";
import { Icon } from "../../elements/Icon";
import { Header } from "../../components/Header";
import { Center, Left, Nav, Right } from "../../components/Nav";
import { Footer } from "../../components/Footer";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <Header>
        <Nav class="pb-8">
          <Left>
            <Icon id="bolt-circle" size="8" />
            <Icon id="wake-circle" size="8" />
          </Left>
          <Center>
            <button class="bg-neutral-800 rounded-full">
              <Icon id="chevron-up" size="6" />
            </button>
          </Center>
          <Right>
            <Icon id="circle-dashed-inset-filled" size="8" />
          </Right>
        </Nav>
      </Header>
      <Main class="pt-header pb-footer">
        <div class="relative w-full h-full">
          <img
            src="/images/image.jpeg"
            alt="Camera"
            class="w-full h-full object-cover"
          />
          <div class="w-6 h-6 border-(white t l) absolute top-px left-px"></div>
          <div class="w-6 h-6 border-(white t r) absolute top-px right-px"></div>
          <div class="w-6 h-6 border-(white b l) absolute bottom-px left-px"></div>
          <div class="w-6 h-6 border-(white b r) absolute bottom-px right-px"></div>
          <div class="absolute left-1/2 bottom-4 -translate-x-1/2 row p-1 gap-2 bg-black/30 children:bg-black/30 rounded-3xl">
            <button class="w-8 h-8 rounded-full text-[10px] col aic jcc font-bold">
              0.5
            </button>
            <button class="w-8 h-8 rounded-full text-(base yellow-500) col aic jcc font-bold row">
              <span>1</span>
              <span class="scale-75">x</span>
            </button>
          </div>
        </div>
      </Main>
      <Footer class="col gap-2 pb-16 pt-4">
        <div class="w-full row text-xs children:(uppercase whitespace-nowrap snap-center font-semibold) gap-6 overflow-x-scroll snap-x px-48">
          <button>Timelapse</button>
          <button>Slow-Mo</button>
          <button>Cinematic</button>
          <button>Video</button>
          <button class="text-yellow-500">Photo</button>
          <button>Portrait</button>
          <button>Pano</button>
        </div>
        <Nav class="px-8">
          <Left>
            <button>
              <img
                src="/images/image.jpeg"
                alt="Camera"
                class="w-11 h-11 rounded"
              />
            </button>
          </Left>
          <Center>
            <button class="p-[2px] border-[3px] border-white rounded-full">
              <div class="w-12 h-12 rounded-full bg-white" />
            </button>
          </Center>
          <Right>
            <button class="bg-neutral-900 text-neutral-100 p-2 rounded-full">
              <Icon id="arrow-triangle-circlepath" size="8" />
            </button>
          </Right>
        </Nav>
      </Footer>
    </Screen>
  );
};
